import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.6/index.ts';
import { assertEquals } from 'https://deno.land/std@0.170.0/testing/asserts.ts';

const deployer = 'ST1PQHQKV0RJQDZKYR4T6YVRQND4K41GC7S1B1KBT';
const wallet1 = 'ST1HTBVD3JGGB49EXR7RMXEDG9TSK56SJQ3X5C8C';
const wallet2 = 'ST1PHB626C4F3W7N97G50C1K5629XG54A6F1C5K4';
const fee = 10000000; // 1 STX

Clarinet.test({
    name: "CNS Registrar: Registration works and transfers STX",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployerAccount = accounts.get('deployer')!;
        let wallet1Account = accounts.get('wallet_1')!;
        
        // 1. Check initial balances
        let initialBalance = chain.getAssetsMaps().assets[".stx"][`${deployerAccount.principal}`];
        
        // 2. Register a name
        let block = chain.mineBlock([
            Tx.contractCall(
                "cns-registrar", 
                "register-name", 
                [types.ascii("testname"), types.some(types.ascii("1BtcAddressExample"))], 
                wallet1Account.principal
            ),
        ]);
        
        // Assert transaction success
        block.receipts[0].result.expectOk().expectUint(1);

        // 3. Check STX balance after registration (STX should be deducted from wallet1)
        let finalBalance = chain.getAssetsMaps().assets[".stx"][`${deployerAccount.principal}`];
        
        // Assert the fee was transferred (Deployer receives the fee in this basic setup)
        assertEquals(finalBalance, initialBalance + fee);
    },
});

Clarinet.test({
    name: "CNS Registrar: Cannot register the same name twice",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet1Account = accounts.get('wallet_1')!;
        
        // Register first time
        chain.mineBlock([
            Tx.contractCall("cns-registrar", "register-name", [types.ascii("duplicate"), types.none()], wallet1Account.principal),
        ]);
        
        // Attempt to register again
        let block = chain.mineBlock([
            Tx.contractCall("cns-registrar", "register-name", [types.ascii("duplicate"), types.none()], wallet1Account.principal),
        ]);
        
        // Assert it fails with the specific error code
        block.receipts[0].result.expectErr().expectUint(101);
    },
});

Clarinet.test({
    name: "CNS Registrar: Name resolution works correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet1Account = accounts.get('wallet_1')!;
        const name = types.ascii("resolveme");
        const btcAddr = types.some(types.ascii("3BtcAddressExample"));

        // Register the name
        chain.mineBlock([
            Tx.contractCall("cns-registrar", "register-name", [name, btcAddr], wallet1Account.principal),
        ]);

        // Resolve the name
        let block = chain.mineBlock([
            Tx.contractCall("cns-registrar", "resolve-name", [name], deployer),
        ]);

        // Assert the resolution data matches the registrant's details
        let expectedResolution = `{stacks-addr: ${wallet1Account.principal}, btc-addr: ${btcAddr}}`;
        block.receipts[0].result.expectOk().expectSome(expectedResolution);
    },
});
