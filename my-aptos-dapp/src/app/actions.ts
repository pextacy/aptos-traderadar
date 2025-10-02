"use server";

import { getLastSuccessVersion } from "@/db/getLastSuccessVersion";
import { GetMessageProps, getMessage } from "@/db/getMessage";
import { GetMessagesProps, getMessages } from "@/db/getMessages";
import { getUserStats, GetUserStatsProps } from "@/db/getUserStats";
import { GetTradeProps, getTrade } from "@/db/getTrade";
import { GetTradesProps, getTrades } from "@/db/getTrades";
import { GetTraderStatsProps, getTraderStats } from "@/db/getTraderStats";
import { Message } from "@/lib/type/message";
import { UserStat } from "@/lib/type/user_stats";
import { Trade } from "@/lib/type/trade";
import { TraderStat } from "@/lib/type/trader_stats";

export const getMessagesOnServer = async ({
  page,
  limit,
  sortedBy,
  order,
}: GetMessagesProps): Promise<{
  messages: Message[];
  total: number;
}> => {
  return getMessages({ page, limit, sortedBy, order });
};

export const getMessageOnServer = async ({
  messageObjAddr,
}: GetMessageProps): Promise<{
  message: Message;
}> => {
  return getMessage({ messageObjAddr });
};

export const getLastVersionOnServer = async (): Promise<number> => {
  return getLastSuccessVersion();
};

export const getUserStatsOnServer = async ({
  page,
  limit,
  sortedBy,
  order,
}: GetUserStatsProps): Promise<{
  userStats: UserStat[];
  total: number;
}> => {
  return getUserStats({ page, limit, sortedBy, order });
};

export const getTradesOnServer = async ({
  page,
  limit,
  sortedBy,
  order,
  status,
  tradeType,
  traderAddr,
}: GetTradesProps): Promise<{
  trades: Trade[];
  total: number;
}> => {
  return getTrades({ page, limit, sortedBy, order, status, tradeType, traderAddr });
};

export const getTradeOnServer = async ({
  tradeObjAddr,
}: GetTradeProps): Promise<{
  trade: Trade;
}> => {
  return getTrade({ tradeObjAddr });
};

export const getTraderStatsOnServer = async ({
  page,
  limit,
  sortedBy,
  order,
}: GetTraderStatsProps): Promise<{
  traderStats: TraderStat[];
  total: number;
}> => {
  return getTraderStats({ page, limit, sortedBy, order });
};
