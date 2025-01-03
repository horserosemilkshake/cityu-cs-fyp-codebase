import md5 from 'md5';
import { ABI } from './assets/MaticABI';
import Web3, { HttpProvider } from 'web3';

let username: string = "";

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

export type Package = {
    id: string,
    package_id: string,
    package_description: string,
    package_weight_in_kg: number,
    package_height: number,
    package_length: number,
    package_width: number,
    package_sender_name: string | null,
    package_recipient_name: string,
    package_pickup_location: string,
    package_pickup_coordinate: string,
    package_destination: string,
    package_destination_coordinate: string,
    finished: boolean,
    responsible_driver_name: string | null,
    deadline: string | number[],
    time: Date,
};

export type DriverProfile = {
    id: number,
    username: string,
    password: null,
    nickname: string,
    eight_digit_hk_phone_number: string,
    cryptowallet_address: string,
    cryptowallet_password: string,
};

export const COLORS = {
    finished: "#059669",
    delivering: "#B91C1C",
    pending: "#6366F1",
};

let phone: string = "";

export function getTel() {
    return phone;
}

export function setTel(u: string) {
    phone = u;
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

export const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => {
            resolve(fileReader.result as string);
        };
        fileReader.onerror = (error) => {
            reject(error);
        };
    });
};

export const explainColors = 'The red path is the path which you traverse to receive the package at the drop off location.\nThe white path is the path which the driver traverses to deliver the package(s) ofr you and the others.';

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

    const web3 = new Web3(new HttpProvider('https://go.getblock.io/58334e125b504020bfa7c5224549a0f7'));
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

export const explainTRD = "Your fees paid for this transaction is temporary deposited in Dandelion's organization account.\n \nYour money is secured and will be paid to the corresponding driver when the delivery is completed successfully.";

export const mode = null;
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

export const GOOGLE_MAPS_API_KEY = "AIzaSyA7F13zRkSzRiNPlt6zbmM5YrgipqPA8Ks"; //Phony key
//AIzaSyBzwogTwDIuG3rAuzrqvJkIhcBk5LvlwKA