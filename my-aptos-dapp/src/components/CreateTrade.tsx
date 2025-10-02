"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

import { getAptosClient } from "@/lib/aptos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
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
import { createTrade } from "@/entry-functions/createTrade";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FormSchema = z.object({
  tradeType: z.string(),
  tokenFrom: z.string().min(1, "Token from is required"),
  tokenTo: z.string().min(1, "Token to is required"),
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

export function CreateTrade() {
  const { toast } = useToast();
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      tradeType: "1",
      tokenFrom: "APT",
      tokenTo: "USDC",
      amountFrom: "1",
      amountTo: "10",
      price: "10",
      notes: "",
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
      createTrade({
        tradeType: parseInt(data.tradeType),
        tokenFrom: data.tokenFrom,
        tokenTo: data.tokenTo,
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
          title: "Success",
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
          description: "Failed to create trade",
        });
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Trade</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSignAndSubmitTransaction)}
            className="flex flex-col justify-between gap-4 w-full"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tradeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trade Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select trade type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Buy</SelectItem>
                        <SelectItem value="2">Sell</SelectItem>
                        <SelectItem value="3">Swap</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Type of trade</FormDescription>
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
                name="tokenFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token From</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="APT" />
                    </FormControl>
                    <FormDescription>Token you're trading from</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tokenTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token To</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="USDC" />
                    </FormControl>
                    <FormDescription>Token you're trading to</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amountFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount From</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.0001" />
                    </FormControl>
                    <FormDescription>Amount of token from</FormDescription>
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
                    <FormDescription>Amount of token to</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Optional notes..." />
                    </FormControl>
                    <FormDescription>Additional trade notes</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={!connected}
              className="w-40 self-start"
            >
              Create Trade
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
