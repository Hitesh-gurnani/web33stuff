"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, CheckIcon, CopyIcon, InfoIcon, EyeIcon, EyeOffIcon, WalletIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { Textarea } from "@/components/ui/textarea";
import { ethers } from "ethers";



export default function Page() {
  const [mnemonic, setMnemonic] = useState<string>(generateMnemonic());
  const [selectedChain, setSelectedChain] = useState<string>("solana");
  const [numberOfWallets, setNumberOfWallets] = useState<number>(1);
  const [newWalletData, setNewWalletData] = useState<
    {
      keypair?: Keypair;
      publicKey: string;
      address?: string; 
      privateKey: {
        uint8Array: Uint8Array;
        base58: string;
        hex: string;
      };
      secretKey?: {
        uint8Array: Uint8Array;
        base58: string;
      };
      chain: string;
    }[]
  >([]);
  const [revealedKeys, setRevealedKeys] = useState<Set<number>>(new Set());

  const chainMapping = {
    solana: "m/44'/501'/0'/0/0",
    ethereum: "m/44'/60'/0'/0/0",
    bitcoin: "m/44'/0'/0'/0/0",
  };

  const createNewSeedPhrase = () => {
    setMnemonic(generateMnemonic());
  };

  const createNewWallet = () => {
    const wallets: {
      keypair?: Keypair;
      publicKey: string;
      address?: string;
      privateKey: {
        uint8Array: Uint8Array;
        base58: string;
        hex: string;
      };
      secretKey?: {
        uint8Array: Uint8Array;
        base58: string;
      };
      chain: string;
    }[] = [];
    const chains = selectedChain === "all" ? ["solana", "ethereum", "bitcoin"] : [selectedChain];
    
    for (let walletIndex = 0; walletIndex < numberOfWallets; walletIndex++) {
      for (const chain of chains) {
        try {
          if (chain === "solana") {
            // Solana uses Ed25519
            const derivationPath = `m/44'/501'/0'/0'`;
            const seed = mnemonicToSeedSync(mnemonic);
            const derivedSeed = derivePath(derivationPath, seed.toString("hex")).key;
            const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;

            const keypair = Keypair.fromSecretKey(secret);
            const privateKey = secret.slice(0, 32);

            const privateKeyBase58 = bs58.encode(privateKey);
            const privateKeyHex = Array.from(privateKey)
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("");
            const secretKeyBase58 = bs58.encode(secret);

            wallets.push({
              keypair,
              publicKey: keypair.publicKey.toBase58(),
              privateKey: {
                uint8Array: privateKey,
                base58: privateKeyBase58,
                hex: privateKeyHex,
              },
              secretKey: {
                uint8Array: secret,
                base58: secretKeyBase58,
              },
              chain,
            });
          } else if (chain === "ethereum" || chain === "bitcoin") {
            // Ethereum and Bitcoin use secp256k1
            const coinType = chain === "ethereum" ? 60 : 0;
            // Use relative path (without "m/" prefix) for derivation
            const derivationPath = `44'/${coinType}'/0'/0/${walletIndex}`;
            
            // Create HD node wallet from mnemonic and derive using relative path
            const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic);
            const derivedWallet = hdNode.derivePath(derivationPath);
            
            const privateKeyHex = derivedWallet.privateKey.slice(2); // Remove '0x' prefix
            const privateKeyBytes = new Uint8Array(
              privateKeyHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
            );

            wallets.push({
              publicKey: derivedWallet.publicKey,
              address: derivedWallet.address,
              privateKey: {
                uint8Array: privateKeyBytes,
                base58: bs58.encode(privateKeyBytes),
                hex: privateKeyHex,
              },
              chain,
            });
          }
        } catch (error) {
          console.error(`Error creating wallet for ${chain}:`, error);
          toast.error(`Failed to create wallet for ${chain}`, {
            duration: 2000,
            position: "top-right",
          });
        }
      }
    }

    if (wallets.length > 0) {
      setNewWalletData((prev) => [...prev, ...wallets]);
      toast.success(`Created ${wallets.length} wallet${wallets.length > 1 ? 's' : ''}!`, {
        duration: 2000,
        position: "top-right",
        style: {
          fontSize: "14px",
          fontWeight: "semibold",
          fontFamily: "var(--font-play)",
        },
      });
    }
  };

  const toggleRevealKey = (index: number) => {
    setRevealedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`, {
      duration: 2000,
      position: "top-right",
      style: {
        fontSize: "14px",
        fontWeight: "semibold",
        fontFamily: "var(--font-play)",
      },
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full h-full flex flex-col">
      <motion.div
        className="flex gap-4 items-center justify-between px-6 py-4 mr-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            className="font-[family-name:var(--font-play)]"
            onClick={createNewSeedPhrase}
          >
            Generate new seed phrase
          </Button>
        </motion.div>

        <motion.div className="flex items-center gap-2">
          <Select
            value={selectedChain}
            onValueChange={(value: string) => setSelectedChain(value)}
          >
            <SelectTrigger className="w-[200px] font-[family-name:var(--font-play)]">
              <SelectValue placeholder="Select blockchain" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="font-[family-name:var(--font-play)]">
                  Generate Keypair for...
                </SelectLabel>
                <SelectItem
                  value="all"
                  className="font-[family-name:var(--font-play)]"
                >
                  All Chains
                </SelectItem>
                <SelectItem
                  value="solana"
                  className="font-[family-name:var(--font-play)]"
                >
                  Solana
                </SelectItem>
                <SelectItem
                  value="ethereum"
                  className="font-[family-name:var(--font-play)]"
                >
                  Ethereum
                </SelectItem>
                <SelectItem
                  value="bitcoin"
                  className="font-[family-name:var(--font-play)]"
                >
                  Bitcoin
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            defaultValue="1"
            onValueChange={(value: string) => setNumberOfWallets(Number(value))}
          >
            <SelectTrigger className="w-[200px] font-[family-name:var(--font-play)]">
              <SelectValue placeholder="Select number of wallets" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="font-[family-name:var(--font-play)]">
                  Select number of wallets
                </SelectLabel>
                <SelectItem
                  value="1"
                  className="font-[family-name:var(--font-play)]"
                >
                  1
                </SelectItem>
                <SelectItem
                  value="2"
                  className="font-[family-name:var(--font-play)]"
                >
                  2
                </SelectItem>
                <SelectItem
                  value="3"
                  className="font-[family-name:var(--font-play)]"
                >
                  3
                </SelectItem>
                <SelectItem
                  value="4"
                  className="font-[family-name:var(--font-play)]"
                >
                  4
                </SelectItem>
                <SelectItem
                  value="5"
                  className="font-[family-name:var(--font-play)]"
                >
                  5
                </SelectItem>
                <SelectItem
                  value="6"
                  className="font-[family-name:var(--font-play)]"
                >
                  6
                </SelectItem>
                <SelectItem
                  value="7"
                  className="font-[family-name:var(--font-play)]"
                >
                  7
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <InfoIcon className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="end"
                  className="font-[family-name:var(--font-play)]"
                >
                  <span className="font-[family-name:var(--font-play)]">
                    Click to see what's happening behind the scenes
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.div>
      </motion.div>


      <div className="flex-1 flex flex-col items-center px-6 py-4 overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto space-y-6">
         
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-xl font-bold font-[family-name:var(--font-play)] text-center">
                  Seed Phase
                </CardTitle>
                <CardDescription className="text-center font-[family-name:var(--font-play)]">
                  The seed phase is the initial phase of the wallet creation
                  process. It is used to generate the wallet address and the
                  private key.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div
                  className="grid grid-cols-3 md:grid-cols-4 gap-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {mnemonic.split(" ").map((word, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ scale: 1.06, y: -5 }}
                      className="relative"
                    >
                      <Badge
                        variant="outline"
                        className="w-full py-3 px-3 text-sm font-[family-name:var(--font-play)] cursor-default border-2 hover:border-blue-400 dark:hover:border-blue-500 transition-all flex items-center justify-between gap-2 bg-background dark:bg-card/50"
                      >
                        <span className="text-xs text-muted-foreground font-semibold">
                          {index + 1}
                        </span>
                        <span className="flex-1 text-center font-semibold">
                          {word}
                        </span>
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex gap-2 w-full pt-2"
                >
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="secondary"
                      onClick={() => {
                        navigator.clipboard.writeText(mnemonic);
                        toast.success("Seed phrase copied to clipboard!", {
                          duration: 2000,
                          position: "top-right",
                          style: {
                            fontSize: "14px",
                            fontWeight: "semibold",
                            fontFamily: "var(--font-play)",
                            boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
                            border: "none",
                          },
                        });
                      }}
                      className="w-full font-[family-name:var(--font-play)] flex items-center justify-center gap-2"
                    >
                      <CopyIcon className="w-4 h-4" />
                      Copy Seed Phrase
                    </Button>
                  </motion.div>

                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="secondary"
                      onClick={createNewWallet}
                      className="w-full font-[family-name:var(--font-play)] flex items-center justify-center gap-2"
                    >
                      Create Wallet
                      <ArrowRightIcon className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

         
          {newWalletData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <WalletIcon className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold font-[family-name:var(--font-play)]">
                  Created Wallets ({newWalletData.length})
                </h2>
              </div>

              <div className="grid gap-4">
                {newWalletData.map((wallet, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="w-full border-2 border-primary/20 dark:border-primary/30">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg font-bold font-[family-name:var(--font-play)] flex items-center gap-2">
                            <Badge variant="secondary" className="font-[family-name:var(--font-play)]">
                              {wallet.chain.toUpperCase()}
                            </Badge>
                            Wallet #{index + 1}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                       
                        {wallet.address && (
                          <div className="space-y-2">
                            <label className="text-sm font-semibold font-[family-name:var(--font-play)] text-muted-foreground">
                              Address
                            </label>
                            <div className="flex gap-2">
                              <Textarea
                                readOnly
                                value={wallet.address}
                                className="font-mono text-sm bg-muted/50 dark:bg-muted/30 resize-none"
                                rows={2}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(wallet.address!, "Address")}
                                className="shrink-0"
                              >
                                <CopyIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                      
                        {wallet.chain === "solana" && (
                          <div className="space-y-2">
                            <label className="text-sm font-semibold font-[family-name:var(--font-play)] text-muted-foreground">
                              Public Key
                            </label>
                            <div className="flex gap-2">
                              <Textarea
                                readOnly
                                value={wallet.publicKey}
                                className="font-mono text-sm bg-muted/50 dark:bg-muted/30 resize-none"
                                rows={2}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(wallet.publicKey, "Public Key")}
                                className="shrink-0"
                              >
                                <CopyIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                      
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold font-[family-name:var(--font-play)] text-muted-foreground">
                              Private Key (Base58)
                            </label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRevealKey(index)}
                              className="h-7 font-[family-name:var(--font-play)]"
                            >
                              {revealedKeys.has(index) ? (
                                <>
                                  <EyeOffIcon className="w-4 h-4 mr-1" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <EyeIcon className="w-4 h-4 mr-1" />
                                  Reveal
                                </>
                              )}
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Textarea
                              readOnly
                              value={revealedKeys.has(index) ? wallet.privateKey.base58 : "•".repeat(wallet.privateKey.base58.length)}
                              className="font-mono text-sm bg-muted/50 dark:bg-muted/30 resize-none"
                              rows={2}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => copyToClipboard(wallet.privateKey.base58, "Private Key (Base58)")}
                              className="shrink-0"
                              disabled={!revealedKeys.has(index)}
                            >
                              <CopyIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

             
                        <div className="space-y-2">
                          <label className="text-sm font-semibold font-[family-name:var(--font-play)] text-muted-foreground">
                            Private Key (Hex)
                          </label>
                          <div className="flex gap-2">
                            <Textarea
                              readOnly
                              value={revealedKeys.has(index) ? wallet.privateKey.hex : "•".repeat(wallet.privateKey.hex.length)}
                              className="font-mono text-sm bg-muted/50 dark:bg-muted/30 resize-none"
                              rows={2}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => copyToClipboard(wallet.privateKey.hex, "Private Key (Hex)")}
                              className="shrink-0"
                              disabled={!revealedKeys.has(index)}
                            >
                              <CopyIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                       
                        {wallet.secretKey && (
                          <div className="space-y-2">
                            <label className="text-sm font-semibold font-[family-name:var(--font-play)] text-muted-foreground">
                              Secret Key (Base58) - 64 bytes
                            </label>
                            <div className="flex gap-2">
                              <Textarea
                                readOnly
                                value={revealedKeys.has(index) ? wallet.secretKey.base58 : "•".repeat(wallet.secretKey.base58.length)}
                                className="font-mono text-sm bg-muted/50 dark:bg-muted/30 resize-none"
                                rows={2}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(wallet.secretKey!.base58, "Secret Key")}
                                className="shrink-0"
                                disabled={!revealedKeys.has(index)}
                              >
                                <CopyIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
