import re
import unittest
import requests
import main


class MyTestCase(unittest.TestCase):
    def test_wallet_view(self):
        url = 'http://127.0.0.1:1234/balance'
        payload = {"wallet_address": "0x3EEf2554B7d4fD4863E95Dd486519F595E09F140"}
        response = requests.post(url, json=payload)
        amount = float(response.content.decode().strip()[1:-1])

        self.assertIsNotNone(response)
        self.assertEqual(200, response.status_code)
        self.assertGreater(amount, 0)

    def test_wallet_transaction(self):
        url = 'http://127.0.0.1:1234/balance'
        payload = {"wallet_address": "0x3EEf2554B7d4fD4863E95Dd486519F595E09F140"}
        response = requests.post(url, json=payload)
        old_payer_amount = float(response.content.decode().strip()[1:-1])

        url = 'http://127.0.0.1:1234/balance'
        payload = {"wallet_address": "0x3EEf2554B7d4fD4863E95Dd486519F595E09F140"}
        response = requests.post(url, json=payload)
        old_recipient_amount = float(response.content.decode().strip()[1:-1])


if __name__ == '__main__':
    unittest.main()
