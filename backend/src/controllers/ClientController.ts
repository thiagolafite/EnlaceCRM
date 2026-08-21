import { Request, Response } from 'express';
import { ClientService } from '../services/ClientService';

export class ClientController {
  static async list(req: Request, res: Response) {
    try {
      const { search, status, preferredChannel, lgpdConsent, page, limit } = req.query;
      const currentUser = (req as any).user;
      
      const lgpdBool = lgpdConsent !== undefined ? lgpdConsent === 'true' : undefined;

      const result = await ClientService.list(
        {
          search: search as string,
          status: status as string,
          lgpdConsent: lgpdBool,
          page: page ? Number(page) : undefined,
          limit: limit ? Number(limit) : undefined,
        },
        currentUser
      );

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Erro ao listar clientes' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;
      const client = await ClientService.getById(id, currentUser);
      return res.json(client);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const client = await ClientService.create(req.body, currentUser);
      return res.status(201).json(client);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;
      const client = await ClientService.update(id, req.body, currentUser);
      return res.json(client);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;
      const result = await ClientService.delete(id, currentUser);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async toggleLgpd(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { consent } = req.body;
      const currentUser = (req as any).user;
      const updated = await ClientService.toggleLgpdConsent(id, Boolean(consent), currentUser);
      return res.json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const stats = await ClientService.getStats(currentUser);
      return res.json(stats);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
