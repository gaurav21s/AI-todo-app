import { type ChatCompletionMessage } from 'openai/resources';
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { type Task, type User } from "@shared/schema";

interface TaskReport {
  executiveSummary: {
    summary: string;
    metrics: string[];
  };
  taskAnalysis: string;
  productivityMetrics: string;
  workStyleAnalysis: string;
  recommendations: string[];
}

interface TaskInsights {
  taskGroups: {
    name: string;
    tasks: string[];
  }[];
  recommendations: string[];
  completionRate: string;
}

export class GroqService {
  private model: ChatGroq;

  constructor() {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY must be set");
    }

    this.model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      modelName: "llama-3.3-70b-versatile",
    });
  }

  async generateReport(tasks: Task[], insights: TaskInsights, user: User): Promise<TaskReport> {
    try {
      if (!tasks || tasks.length === 0) {
        return this.getFallbackReport(tasks);
      }

      const systemPrompt = new SystemMessage(
        `You are an AI assistant that generates comprehensive task management reports.
        Create a detailed report that includes task analysis, productivity insights, and user profile analysis.
        Format the response as a JSON object with the following structure:
        {
          "executiveSummary": {
            "summary": "Clear overview of task management status",
            "metrics": ["key metrics as an array of strings"]
          },
          "taskAnalysis": "Detailed analysis of task patterns and completion",
          "productivityMetrics": "Analysis of productivity trends",
          "workStyleAnalysis": "Analysis of user work style and habits",
          "recommendations": ["Array of actionable recommendations"]
        }`
      );

      const userPrompt = new HumanMessage(
        `Generate a comprehensive report based on:
        User: ${JSON.stringify(user)}
        Tasks: ${JSON.stringify(tasks)}
        Insights: ${JSON.stringify(insights)}

        Include:
        1. Executive summary of task management
        2. Detailed task analysis and patterns
        3. Productivity metrics and trends
        4. User work style analysis
        5. Strategic recommendations

        Ensure all responses are professional and actionable.
        Return ONLY valid JSON matching the specified structure.`
      );

      console.log('Sending request to Groq API...');
      const response = await this.model.invoke([systemPrompt, userPrompt]);
      console.log('Raw LLM Response:', response.content);

      try {
        const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

        // Extract JSON from potential markdown or code blocks
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                         content.match(/`([\s\S]*?)`/) ||
                         content.match(/{[\s\S]*}/);

        if (!jsonMatch) {
          console.error('No JSON found in response');
          throw new Error('Invalid AI response format');
        }

        const jsonString = jsonMatch[1] || jsonMatch[0];
        const parsedResponse = JSON.parse(jsonString.trim()) as TaskReport;

        // Validate response structure
        if (!this.validateReportStructure(parsedResponse)) {
          console.error('Invalid report structure', parsedResponse);
          throw new Error('Invalid report structure received from AI');
        }

        return parsedResponse;
      } catch (parseError) {
        console.error('Failed to parse AI report:', parseError);
        throw new Error(`Failed to parse AI response: ${parseError.message}`);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      return this.getFallbackReport(tasks);
    }
  }

  private validateReportStructure(report: any): report is TaskReport {
    try {
      return (
        report &&
        typeof report.executiveSummary === 'object' &&
        typeof report.executiveSummary.summary === 'string' &&
        Array.isArray(report.executiveSummary.metrics) &&
        typeof report.taskAnalysis === 'string' &&
        typeof report.productivityMetrics === 'string' &&
        typeof report.workStyleAnalysis === 'string' &&
        Array.isArray(report.recommendations)
      );
    } catch (error) {
      console.error('Report validation error:', error);
      return false;
    }
  }

  private getFallbackReport(tasks: Task[]): TaskReport {
    const completedTasks = tasks.filter(t => t.completed);
    const completionRate = tasks.length > 0 
      ? Math.round((completedTasks.length / tasks.length) * 100) 
      : 0;

    return {
      executiveSummary: {
        summary: "Task Management Overview (Generated from fallback)",
        metrics: [
          `Total Tasks: ${tasks.length}`,
          `Completed Tasks: ${completedTasks.length}`,
          `Completion Rate: ${completionRate}%`,
          `High Priority Tasks: ${tasks.filter(t => t.priority === 'high').length}`,
        ]
      },
      taskAnalysis: "A detailed task analysis could not be generated at this time. Please try again later.",
      productivityMetrics: `Current completion rate is ${completionRate}%. Task metrics are being calculated.`,
      workStyleAnalysis: "Work style analysis is temporarily unavailable. Please try again later.",
      recommendations: [
        "Consider reviewing and updating task priorities",
        "Regular task list maintenance is recommended",
        "Set realistic deadlines for better task management"
      ]
    };
  }

  async generateTaskInsights(tasks: Task[]): Promise<TaskInsights> {
    if (!tasks.length) {
      return {
        taskGroups: [],
        recommendations: ["Start by adding some tasks to get AI-powered insights"],
        completionRate: "0%"
      };
    }

    try {
      const systemPrompt = new SystemMessage(
        `You are an AI assistant that analyzes tasks and provides actionable insights. 
        Return a JSON object with this exact structure:
        {
          "taskGroups": [{"name": "group name", "tasks": ["task title 1", "task title 2"]}],
          "recommendations": ["specific recommendation 1", "specific recommendation 2"],
          "completionRate": "X%"
        }`
      );

      const userPrompt = new HumanMessage(
        `Analyze these tasks and provide insights: ${JSON.stringify(tasks)}`
      );

      const response = await this.model.invoke([systemPrompt, userPrompt]);
      console.log('Raw Insights Response:', response.content);

      try {
        const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                         content.match(/`([\s\S]*?)`/) ||
                         content.match(/{[\s\S]*}/);

        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }

        const jsonString = jsonMatch[1] || jsonMatch[0];
        const parsedResponse = JSON.parse(jsonString) as TaskInsights;

        if (!this.validateInsightsStructure(parsedResponse)) {
          throw new Error('Invalid insights structure');
        }

        return parsedResponse;
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return this.getFallbackInsights(tasks);
      }
    } catch (error) {
      console.error('Failed to generate task insights:', error);
      return this.getFallbackInsights(tasks);
    }
  }

  private validateInsightsStructure(insights: any): insights is TaskInsights {
    return (
      insights &&
      Array.isArray(insights.taskGroups) &&
      insights.taskGroups.every((group: any) => 
        typeof group.name === 'string' &&
        Array.isArray(group.tasks)
      ) &&
      Array.isArray(insights.recommendations) &&
      typeof insights.completionRate === 'string'
    );
  }

  private getFallbackInsights(tasks: Task[]): TaskInsights {
    const completedTasks = tasks.filter(t => t.completed);
    const completionRate = tasks.length > 0 
      ? Math.round((completedTasks.length / tasks.length) * 100) 
      : 0;

    return {
      taskGroups: [{ 
        name: "All Tasks", 
        tasks: tasks.map(t => t.title)
      }],
      recommendations: [
        'Focus on completing high-priority tasks first',
        'Review and update task priorities regularly'
      ],
      completionRate: `${completionRate}%`
    };
  }

  async generateTaskTags(title: string, description: string): Promise<string[]> {
    try {
      const systemPrompt = new SystemMessage(
        'You are an AI assistant that generates relevant, concise tags for tasks. Return only 2-3 tags separated by commas, no other text.'
      );

      const userPrompt = new HumanMessage(
        `Generate relevant tags for this task:
        Title: ${title}
        Description: ${description}`
      );

      const response = await this.model.invoke([systemPrompt, userPrompt]);
      const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
      console.log('Raw Tags Response:', content);

      const tags = content
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0 && !tag.includes('\n'))
        .slice(0, 3);

      return tags.length > 0 ? tags : ['task'];
    } catch (error) {
      console.error('Failed to generate task tags:', error);
      return ['task'];
    }
  }
}

export const groqService = new GroqService();