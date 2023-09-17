import { NextRequest } from "next/server";

import { request } from "../../common";
import type { Response } from "../../common";

async function handle(req: NextRequest) {
  return await request(req);
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";

export interface Balance {
  id: number;
  calcType: string;
  calcTypeId: number;
  source: string;
  sourceId: number;
  expireTime: string;
  createTime: string;
  updateTime: string;
  tokens: number;
  chatCount: number;
  advancedChatCount: number;
  drawCount: number;
  state: number;
  userId: number;
}

export interface ProfileData {
  id: number;
  name: string;
  username: string;
  status: number;
  role: number;
  access_token: number;
  quota: number;
}

export type ProfileResponse = Response<ProfileData>;
