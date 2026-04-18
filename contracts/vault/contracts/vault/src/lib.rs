#![no_std]
mod test;
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, token};

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Balance(Address),
    Token,
}

#[contract]
pub struct VaultContract;

#[contractimpl]
impl VaultContract {
    /// Initialize the contract with the native token address (SAC)
    pub fn init(e: Env, token: Address) {
        if e.storage().instance().has(&DataKey::Token) {
            panic!("already initialized");
        }
        e.storage().instance().set(&DataKey::Token, &token);
    }

    /// Deposit funds into the vault
    pub fn deposit(e: Env, user: Address, amount: i128) {
        user.require_auth();
        
        let token_addr = Self::get_token(&e);
        let client = token::Client::new(&e, &token_addr);
        
        // Transfer from user to this contract
        client.transfer(&user, &e.current_contract_address(), &amount);
        
        // Update user balance
        let mut balance = Self::balance(e.clone(), user.clone());
        balance += amount;
        e.storage().persistent().set(&DataKey::Balance(user), &balance);
    }

    /// Withdraw funds from the vault
    pub fn withdraw(e: Env, user: Address, amount: i128) {
        user.require_auth();
        
        let mut balance = Self::balance(e.clone(), user.clone());
        if balance < amount {
            panic!("insufficient balance");
        }
        
        let token_addr = Self::get_token(&e);
        let client = token::Client::new(&e, &token_addr);
        
        // Transfer from contract back to user
        client.transfer(&e.current_contract_address(), &user, &amount);
        
        // Update user balance
        balance -= amount;
        e.storage().persistent().set(&DataKey::Balance(user), &balance);
    }

    /// Get current locked balance for a user
    pub fn balance(e: Env, user: Address) -> i128 {
        e.storage()
            .persistent()
            .get(&DataKey::Balance(user))
            .unwrap_or(0)
    }

    fn get_token(e: &Env) -> Address {
        e.storage().instance().get(&DataKey::Token).expect("not initialized")
    }
}
