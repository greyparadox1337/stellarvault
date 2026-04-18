#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::{Address as _, Events}, Env, Address, vec, IntoVal};

#[test]
fn test_vault() {
    let e = Env::default();
    e.mock_all_auths();

    let contract_id = e.register_contract(None, VaultContract);
    let client = VaultContractClient::new(&e, &contract_id);

    // Register a token
    let admin = Address::generate(&e);
    let token_address = e.register_stellar_asset_contract(admin.clone());
    let token = token::Client::new(&e, &token_address);
    let token_admin = token::StellarAssetClient::new(&e, &token_address);

    // Init vault
    client.init(&token_address);

    let user = Address::generate(&e);
    token_admin.mint(&user, &1000);

    assert_eq!(token.balance(&user), 1000);

    // Deposit
    client.deposit(&user, &500);
    assert_eq!(token.balance(&user), 500);
    assert_eq!(token.balance(&contract_id), 500);
    assert_eq!(client.balance(&user), 500);

    // Withdraw
    client.withdraw(&user, &200);
    assert_eq!(token.balance(&user), 700);
    assert_eq!(client.balance(&user), 300);
}

#[test]
#[should_panic(expected = "insufficient balance")]
fn test_insufficient_funds() {
    let e = Env::default();
    e.mock_all_auths();

    let contract_id = e.register_contract(None, VaultContract);
    let client = VaultContractClient::new(&e, &contract_id);

    let admin = Address::generate(&e);
    let token_address = e.register_stellar_asset_contract(admin.clone());
    client.init(&token_address);

    let user = Address::generate(&e);
    client.withdraw(&user, &100);
}
