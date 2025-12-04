# Clarity Name Service (CNS)

The Clarity Name Service (CNS) is a decentralized identity and domain name resolution system built on the Stacks L2 blockchain, secured by Bitcoin. CNS allows users to register unique, non-fungible names (e.g., `name.stx`) and permanently link them to their cryptocurrency addresses.

This project is open-source and developed under the guidelines of the **Code for STX** program.

## 🌟 Features

* **SIP-009 Standard:** Name domains are issued as non-fungible tokens (NFTs).
* **Decentralized Registration:** Fully on-chain name registration and transfer logic.
* **Address Resolution:** Resolves human-readable names to both Stacks and Bitcoin addresses.
* **Front-End Integration:** A user-friendly interface using `Stacks.js` for seamless wallet connection and transaction signing.

## 🛠️ Project Structure

The project is divided into two main components:

1.  **Clarity Contracts (`/contracts`):** The core logic for registration and resolution, developed using the Clarity language.
2.  **Front-End UI (`/frontend`):** A React-based application for user interaction, utilizing `@stacks/connect` and `@stacks/transactions`.

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (LTS version)
* [Clarinet](https://docs.stacks.co/write-smart-contracts/clarinet) (The Stacks smart contract toolchain)

### Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/clarity-name-service.git](https://github.com/your-username/clarity-name-service.git)
    cd clarity-name-service
    ```

2.  **Initialize Clarity Contracts:**
    ```bash
    # Clarinet files were already initialized during project creation
    clarinet check 
    ```

3.  **Setup Front-End Dependencies:**
    ```bash
    cd frontend
    npm install
    ```

### Running Tests

To run the unit tests for the Clarity contracts using Clarinet:
```bash
cd .. 
clarinet test
