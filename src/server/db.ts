import { PrismaClient } from "@prisma/client";

import { env } from "@/env";

const createPrismaClient = () =>
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

declare global {
  var prisma: ReturnType<typeof createPrismaClient> | undefined;
}

export const db = globalThis.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalThis.prisma = db;

// declare global {
// 	namespace PrismaJson {
// 		type QuestionOptions = string[];
// 		type ResultData = {
// 			id: string;
// 			marked: boolean;
// 			selectedAnswer?: number;
// 			writtenAnswer?: string;
// 			aiFeedback?: string;
// 			isCorrect: boolean;
// 			pointsEarned?: number;
// 			timeSpent: number;
// 		}[];
// 		type ChatMessage = {
// 			content: string;
// 			isUser: boolean;
// 			loading?: boolean;
// 		};
// 	}
// }
