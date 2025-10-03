'use client';

import React, { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { buildTradePayload } from '@/lib/traderadar/merkleClient';
import { getAptosClient } from '@/lib/traderadar/hyperionUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface TradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symbol: string;
  currentPrice: number;
}

export function TradeModal({ open, onOpenChange, symbol, currentPrice }: TradeModalProps) {
  const { account, signAndSubmitTransaction } = useWallet();
  const { toast } = useToast();
  const [size, setSize] = useState<string>('0.1');
  const [leverage, setLeverage] = useState<string>('5');
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [loading, setLoading] = useState(false);

  const handleTrade = async () => {
    if (!account) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to trade',
        variant: 'destructive',
      });
      return;
    }

    const sizeNum = parseFloat(size);
    const leverageNum = parseFloat(leverage);

    if (isNaN(sizeNum) || sizeNum <= 0) {
      toast({
        title: 'Invalid Size',
        description: 'Please enter a valid position size',
        variant: 'destructive',
      });
      return;
    }

    if (isNaN(leverageNum) || leverageNum < 1 || leverageNum > 20) {
      toast({
        title: 'Invalid Leverage',
        description: 'Leverage must be between 1x and 20x',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Build trade payload
      const payload = await buildTradePayload(
        account.address.toString(),
        symbol,
        sizeNum,
        direction === 'long',
        leverageNum
      );

      // Sign and submit transaction
      const response = await signAndSubmitTransaction({
        data: payload,
      });

      // Wait for transaction
      const aptos = getAptosClient();
      await aptos.waitForTransaction({ transactionHash: response.hash });

      toast({
        title: 'Trade Executed',
        description: `Successfully opened ${direction} position for ${symbol}`,
      });

      onOpenChange(false);
      setSize('0.1');
      setLeverage('5');
    } catch (error) {
      console.error('Trade error:', error);
      toast({
        title: 'Trade Failed',
        description: error instanceof Error ? error.message : 'Failed to execute trade',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const collateral = (currentPrice * parseFloat(size || '0')) / parseFloat(leverage || '1');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Trade {symbol}</DialogTitle>
          <DialogDescription>
            Open a perpetual position with leverage on Merkle Trade
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Direction Selection */}
          <div className="space-y-2">
            <Label>Direction</Label>
            <RadioGroup
              value={direction}
              onValueChange={(val) => setDirection(val as 'long' | 'short')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="long" id="long" />
                <Label htmlFor="long" className="cursor-pointer">
                  Long (Buy)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="short" id="short" />
                <Label htmlFor="short" className="cursor-pointer">
                  Short (Sell)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Size Input */}
          <div className="space-y-2">
            <Label htmlFor="size">Position Size (in base asset)</Label>
            <input
              id="size"
              type="number"
              step="0.01"
              min="0"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="0.1"
            />
            <p className="text-sm text-muted-foreground">
              Notional Value: ${(currentPrice * parseFloat(size || '0')).toFixed(2)}
            </p>
          </div>

          {/* Leverage Input */}
          <div className="space-y-2">
            <Label htmlFor="leverage">Leverage (1x - 20x)</Label>
            <input
              id="leverage"
              type="number"
              step="1"
              min="1"
              max="20"
              value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="5"
            />
          </div>

          {/* Trade Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Entry Price:</span>
              <span className="font-medium">${currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Required Collateral:</span>
              <span className="font-medium">${collateral.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Leverage:</span>
              <span className="font-medium">{leverage}x</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Direction:</span>
              <span className={`font-medium ${direction === 'long' ? 'text-green-500' : 'text-red-500'}`}>
                {direction.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className={`flex-1 ${direction === 'long' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              onClick={handleTrade}
              disabled={loading || !account}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Executing...
                </>
              ) : (
                `Open ${direction === 'long' ? 'Long' : 'Short'} Position`
              )}
            </Button>
          </div>

          {!account && (
            <p className="text-sm text-center text-muted-foreground">
              Connect your wallet to start trading
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
