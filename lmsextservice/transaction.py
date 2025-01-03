import math

from web3 import Web3, HTTPProvider
from web3.gas_strategies.rpc import rpc_gas_price_strategy


# 创建web3连接
def create_web3(rpc):
    web3 = Web3(HTTPProvider(rpc))
    # blockNumber = web3.eth.get_block_number
    # print("当前区块高度：", blockNumber)
    return web3


# 查看余额
def check_balance(web3, addr, type):
    balance = web3.from_wei(web3.eth.get_balance(addr), "ether")
    print(f"Account {addr} has a {type} balance of: {balance} ")
    return balance


def transfer_to(web3, addrFrom, key, addrTo, num, type, chainId):
    account_from = {
        "private_key": key,
        "address": addrFrom,
    }
    print(
        f'Prepare to transfer {num} {type} from {addrFrom} to account {addrTo} with a private key {key}'
    )
    # 查询当前价格
    # 设置gas价格
    web3.eth.set_gas_price_strategy(rpc_gas_price_strategy)

    # 创建交易签名
    tx_create = web3.eth.account.sign_transaction(
        {
            "nonce": web3.eth.get_transaction_count(addrFrom),
            "gasPrice": web3.to_wei(34, 'gwei'),
            "gas": 2000000,
            "to": addrTo,
            "chainId": chainId,
            "value": web3.to_wei(num, "ether"),  # 转账数量
        },
        key,
    )

    print("Current Gas is：", web3.eth.gas_price / math.pow(10, 18))

    # if input('Ok?') != "Y":
    #     return
    # 发送和等待
    tx_hash = web3.eth.send_raw_transaction(tx_create.rawTransaction)
    tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"Transaction Completed! Hash: {tx_receipt.transactionHash.hex()}")

    return tx_receipt.transactionHash.hex()


def transfer(address_from, address_to, private_key_of_from_address, num="0.01", type="MATIC", chainId=137,
             rpc="https://polygon-rpc.com"):
    old_amount = -1.0
    reference_hash = ""
    try:
        web3 = create_web3(rpc)
        if check_balance(web3, address_from, type) < float(num) * 1.001:
            msg = "Insufficient balance in sender's account"
        old_amount = check_balance(web3, address_to, type)
        reference_hash = transfer_to(web3, address_from, private_key_of_from_address, address_to, num, type, chainId)
    except RuntimeError:
        msg = "Transaction failed due to unknown error"
        backup_rpc = 'https://go.getblock.io/58334e125b504020bfa7c5224549a0f7'
        web3 = create_web3(backup_rpc)
        if check_balance(web3, address_from, type) < float(num) * 1.001:
            msg = "Insufficient balance in sender's account"
        old_amount = check_balance(web3, address_to, type)
        reference_hash = transfer_to(web3, address_from, private_key_of_from_address, address_to, num, type, chainId)
    finally:
        if math.isclose(old_amount, check_balance(web3, address_to, type)) or old_amount < 0:
            msg = "Transaction failed due to unknown error"
        else:
            msg = "Success"

        print({
            "message": msg,
            "sender_account_balance": check_balance(web3, address_from, type),
            "recipient_account_balance": check_balance(web3, address_to, type),
            "reference_hash" : reference_hash
        })

        return {
            "message": msg,
            "sender_account_balance": check_balance(web3, address_from, type),
            "recipient_account_balance": check_balance(web3, address_to, type),
            "reference_hash" : reference_hash
        }


if __name__ == '__main__':
    address_from = "0x3EEf2554B7d4fD4863E95Dd486519F595E09F140"  # 发款地址
    address_to = "0xAa65ddf86831b99b5dd87aA1A32E7aA94Cc4BE29"  # 收款地址
    rpc = "https://polygon.llamarpc.com"  # RPC
    testrpc = "https://rpc-mumbai.maticvigil.com"
    key = 'fbab60033a0d92359cfa2bd29ff9241e299bbae1c091375f7934cf7884ffdd7e'  # 钱包私钥
    transfer(address_from, address_to, key)