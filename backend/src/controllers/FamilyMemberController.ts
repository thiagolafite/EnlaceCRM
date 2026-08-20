import { Request, Response } from 'express';
import { FamilyMemberService } from '../services/FamilyMemberService';

export class FamilyMemberController {
  static async create(req: Request, res: Response) {
    try {
      const member = await FamilyMemberService.create(req.body);
      return res.status(201).json(member);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const member = await FamilyMemberService.update(id, req.body);
      return res.json(member);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await FamilyMemberService.delete(id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async listByClient(req: Request, res: Response) {
    try {
      const { clientId } = req.params;
      const members = await FamilyMemberService.listByClient(clientId);
      return res.json(members);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
