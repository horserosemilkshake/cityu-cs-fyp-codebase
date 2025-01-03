import md5 from 'md5';

import * as crypto from "crypto";
import Web3, { HttpProvider, Uint256 } from 'web3';
import { ABI } from './assets/MaticABI';
import {Transaction, TxData} from 'ethereumjs-tx';

let username: string = "";

// Encryption
export function encryptAES(text: string, key: string, iv: string): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

// Decryption
export function decryptAES(encrypted: string, key: string, iv: string): string {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Example usage
export const key = '0123456789abcdef0123456789abcdef';
export const iv = '0123456789abcdef';
const plaintext = 'This is a secret message.';

export const explainTRD = "Your fees paid for this transaction is temporary deposited in Dandelion's organization account.\n \nYour money is secured and will be paid to the corresponding driver when the delivery is completed successfully.";

export function getUsername() {
    return username;
}

export function setUname(u: string) {
    username = u;
}

let cipher = "salt";
export function getCipher() {
    return cipher;
}

export function encryptMD5(u: string) {
    return md5(u);
}

let phone: string = "";

export function getTel() {
    return phone;
}

export function setTel(u: string) {
    phone = u;
}

let warehousePresent: number = 0;

export function getWarehousePresent() {
    return warehousePresent;
}

export function setWarehousePresent(w: number) {
    warehousePresent = w;
}

export async function checkWhetherAddressIsValid(wa: string) {
    const extUrl = externalServiceURL + '/balance';
    const extRes = await fetch(extUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "wallet_address": wa }),
    });

    const balance: string = await extRes.json();

    try {
        const balance_double = parseFloat(balance);
        return true;
    } catch (error) {
        return false;
    }
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers

    // Convert latitude and longitude to radians
    const phi1 = toRadians(lat1);
    const phi2 = toRadians(lat2);
    const deltaPhi = toRadians(lat2 - lat1);
    const deltaLambda = toRadians(lon2 - lon1);

    // Calculate the Haversine formula
    const a = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance * 1000; //in meters
}

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

export async function getWalletBalance(wallet_address: string, dp: number): Promise<number> {
    const web3 = new Web3(new HttpProvider('https://go.getblock.io/'));
    console.log(await web3.eth.getBlockNumber());

    const tokenContract = "0x0000000000000000000000000000000000001010";
    const tokenHolder = wallet_address;

    // Define the ERC-20 token contract
    const contract = new web3.eth.Contract(ABI, tokenContract);

    // Execute balanceOf() to retrieve the token balance
    const result = await contract.methods.balanceOf(tokenHolder).call();

    // Convert the value from Wei to Ether
    const formattedResult = web3.utils.fromWei(Number(result), "ether");

    return +((+formattedResult).toFixed(dp));
}

export async function webRequest(url: string, m: string, stringifiedJson: BodyInit | null | undefined) {
    const res = await fetch(url, {
        method: m,
        headers: {
            'Content-Type': 'application/json',
            // Add any additional headers if required
        },
        body: stringifiedJson,
    });
    return await res.json();
}

export async function payment(payer_cryptowallet_address: string, payer_cryptowallet_key: string, receiver_username: string, receiver_role: string, value: string): Promise<string> {
    const toAddress = await webRequest(baseURL + "/api/v1/auth/address", "POST", JSON.stringify({ username: receiver_username, password: "", role: receiver_role }));

    const web3 = new Web3(new HttpProvider('https://go.getblock.io/'));
    console.log(await web3.eth.getBlockNumber());

    const tokenContract = "0x0000000000000000000000000000000000001010";
    const tokenHolder: string = payer_cryptowallet_address;

    let gasPrice: bigint = await web3.eth.getGasPrice();
    let gasLimit = 4000000;
    let count = await web3.eth.getTransactionCount(payer_cryptowallet_address);
    let myContract = new web3.eth.Contract(ABI, tokenContract);
    console.log("Transferring " + parseFloat(value) * 1e18 + " from " + payer_cryptowallet_address + " to " + toAddress);
    let data = myContract.methods.transfer(toAddress, parseFloat(value) * 1e18).encodeABI();
    let rawTx = {
        "from": payer_cryptowallet_address,
        // "nonce": "0x" + count.toString(16),
        "gasPrice": web3.utils.toHex(gasPrice),
        "gasLimit": web3.utils.toHex(gasLimit),
        "to": toAddress,
        "value": parseFloat(value) * 1e18,
        "chainId": 137,
        "data": data,
    };

    let transaction_hash = "";
    // web3.eth.accounts.signTransaction(
    //     rawTx,
    //     payer_cryptowallet_key
    // ).then(
    //     tx => {
    //         // serializedTx = ;
    //         web3.eth.sendSignedTransaction(tx.rawTransaction).on('transactionHash', function (txHash) {
    //             console.log("Transaction Hash:" + txHash);
    //         }).on('receipt', function (receipt) {
    //             console.log("Receipt:" + receipt);
    //         }).on('confirmation', function () {
        
    //         }).on('error', function (error) {
    //             console.log("Error: " + error);
    //         });
    //     }
    // )
    return new Promise((resolve, reject) => {
        web3.eth.accounts.signTransaction(rawTx, payer_cryptowallet_key)
          .then(tx => {
            web3.eth.sendSignedTransaction(tx.rawTransaction)
              .on('transactionHash', (txHash) => {
                console.log("Transaction Hash:" + txHash);
                resolve(txHash);
              })
              .on('receipt', (receipt) => {
                console.log("Receipt:" + receipt);
              })
              .on('confirmation', () => {
                // Handle confirmation
              })
              .on('error', (error) => {
                console.log("Error: " + error);
              });
          })
          .catch(err => {
            console.log(err);
          });
      });
}

export const explainColors = 'The red path is the path which you traverse to receive the package at the drop off location.\n \nThe yellow path is the path which the driver traverses to deliver the package(s) ofr you and the others.';

export let mode = null; // p or t
export const productionServerDomain = "47.238.184.88";
// Domains for testing
// 172.28.162.189
// 172.20.10.2
// 192.168.1.3
// 192.168.1.6
export const testingServerDomain = "localhost";
export const serverDomain = mode === "p" ? productionServerDomain : testingServerDomain;
export const baseURL = "http://" + serverDomain + ":8080";
export const routingURL = "http://" + serverDomain + ":5000";
export const externalServiceURL = "http://" + serverDomain + ":1234"

export const GOOGLE_MAPS_API_KEY = ""; //Phony key
