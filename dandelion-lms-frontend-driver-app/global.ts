import { ABI } from "./Utils/MaticABI";
import { Package } from "./View/PackageSelection";
import Web3, { HttpProvider } from 'web3';

let username: string = "";

export function getUsername() {
    return username;
}

export function setUname(u: string) {
    username = u;
}

let warehousePresent: number = 0;

export function getWarehousePresent() {
    return warehousePresent;
}

export function setWarehousePresent(w: number) {
    warehousePresent = w;
}

export function computeMatic(package_length: number, package_width: number, package_height: number): number {
    const s: number = (package_length * package_width * package_height) / 100;
    const k: number = 10;
    return 1 - Math.pow(Math.E, -s / k);
}

export const calculateTimeDifference = (time1: string, time2: string): [number, number] => {
    const date1 = new Date(time1);
    const date2 = new Date(time2);
    const timeDifferenceMs = date2.getTime() - date1.getTime();

    const hours = Math.round(timeDifferenceMs / (1000 * 60 * 60));
    const minutes = Math.round((timeDifferenceMs % (1000 * 60 * 60)) / (1000 * 60));

    return [Math.abs(hours), Math.abs(minutes)];
};

export async function getWalletBalance(wallet_address: string, dp: number): Promise<number> {
    const web3 = new Web3(new HttpProvider('https://go.getblock.io/58334e125b504020bfa7c5224549a0f7'));
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

export async function webRequest(url: string, m: string, stringifiedJson: BodyInit_ | null | undefined) {
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

let mode = "p"; // p or t
export const productionServerDomain = "47.238.184.88";
// Domains for testing
// 172.28.162.189
// 172.20.10.2
// 192.168.1.3
// 192.168.1.6
export const testingServerDomain = "172.19.176.1";
export const serverDomain = mode === "p" ? productionServerDomain : testingServerDomain;
export const baseURL = "http://" + serverDomain + ":8080";
export const routingURL = "http://" + serverDomain + ":5000";
export const externalServiceURL = "http://" + serverDomain + ":1234"

export const GOOGLE_MAPS_API_KEY = "AIzaSyA7F13zRkSzRiNPlt6zbmM5YrgipqPA8Ks"; //Phony key
//AIzaSyBzwogTwDIuG3rAuzrqvJkIhcBk5LvlwKA