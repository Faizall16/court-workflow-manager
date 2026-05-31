import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.query;

    const whereCondition: any = {};

    if (role && typeof role === "string") {
      whereCondition.role = role.toUpperCase();
    }

    const users = await prisma.user.findMany({
      where: whereCondition,
      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
