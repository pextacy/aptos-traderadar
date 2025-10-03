"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

import { getAptosClient } from "@/lib/aptos";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TransactionOnExplorer } from "@/components/ExplorerLink";
import { updateTrade } from "@/entry-functions/updateTrade";
import { Trade } from "@/lib/type/trade";

const FormSchema = z.object({
  amountFrom: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  amountTo: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }),
  notes: z.string(),
});

type UpdateTradeProps = {
  trade: Trade;
  children: React.ReactNode;
};

export function UpdateTrade({ trade, children }: UpdateTradeProps) {
  const { toast } = useToast();
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      amountFrom: (trade.amount_from / 100000000).toString(),
      amountTo: (trade.amount_to / 100000000).toString(),
      price: (trade.price / 100000000).toString(),
      notes: trade.notes,
    },
  });

  const onSignAndSubmitTransaction = async (
    data: z.infer<typeof FormSchema>
  ) => {
    if (!account) {
      console.error("Wallet not available");
      return;
    }

    // Convert to octas (multiply by 100000000)
    const amountFromOctas = Math.floor(parseFloat(data.amountFrom) * 100000000);
    const amountToOctas = Math.floor(parseFloat(data.amountTo) * 100000000);
    const priceOctas = Math.floor(parseFloat(data.price) * 100000000);

    signAndSubmitTransaction(
      updateTrade({
        tradeObjAddr: trade.trade_obj_addr,
        amountFrom: amountFromOctas,
        amountTo: amountToOctas,
        price: priceOctas,
        notes: data.notes,
      })
    )
      .then((committedTransaction) => {
        return getAptosClient().waitForTransaction({
          transactionHash: committedTransaction.hash,
        });
      })
      .then((executedTransaction) => {
        toast({
          title: "Trade Updated",
          description: (
            <TransactionOnExplorer hash={executedTransaction.hash} />
          ),
        });
        return new Promise((resolve) => setTimeout(resolve, 3000));
      })
      .then(() => {
        return queryClient.invalidateQueries({ queryKey: ["trades"] });
      })
      .then(() => {
        form.reset();
      })
      .catch((error) => {
        console.error("Error", error);
        toast({
          title: "Error",
          description: "Failed to update trade",
        });
      });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Trade</DialogTitle>
          <DialogDescription>
            Update the amounts, price, and notes for your trade.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSignAndSubmitTransaction)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="amountFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount From</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.0001" />
                  </FormControl>
                  <FormDescription>Amount of {trade.token_from}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amountTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount To</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.0001" />
                  </FormControl>
                  <FormDescription>Amount of {trade.token_to}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (APT)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.0001" />
                  </FormControl>
                  <FormDescription>Trade price in APT</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Optional notes..." />
                  </FormControl>
                  <FormDescription>Additional trade notes</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={!connected}
              className="w-full"
            >
              Update Trade
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
