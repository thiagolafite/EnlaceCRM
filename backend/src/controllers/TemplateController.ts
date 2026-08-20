import { Request, Response } from 'express';
import { TemplateService } from '../services/TemplateService';

export class TemplateController {
  static async list(req: Request, res: Response) {
    try {
      const { eventType, channel } = req.query;
      const templates = await TemplateService.list({
        eventType: eventType as string,
        channel: channel as string,
      });
      return res.json(templates);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const template = await TemplateService.getById(id);
      return res.json(template);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const template = await TemplateService.create(req.body);
      return res.status(201).json(template);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const template = await TemplateService.update(id, req.body);
      return res.json(template);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await TemplateService.delete(id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static getVariables(req: Request, res: Response) {
    const variables = TemplateService.getAvailableVariables();
    return res.json(variables);
  }

  static async preview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await TemplateService.preview(id, true);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async previewCustom(req: Request, res: Response) {
    try {
      const { content } = req.body;
      const result = await TemplateService.preview(content || '', false);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
