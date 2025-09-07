# D.A.I.S.Y. 
**D**ecentralized **A**rtificial **I**ntelligence **S**earch For **Y**ou

**Demo**:
https://www.loom.com/share/bdb90fd49d7c45969368118001563eda?sid=f3fd39ac-68ab-48c5-bc12-cfd8215c4faf

Today, most online activity — search, communication, and even creative work — is handled by centralized platforms like Google, OpenAI, or Meta. While these companies offer powerful services, relying on them comes with serious **data privacy risks**:

- **Data Collection & Profiling**  
  Every search, query, or interaction is logged and also linked to your profile. Over time, this builds detailed profiles of individuals, which can be monetized or repurposed without full user consent.

- **Centralized Control**  
  A small number of corporations decide what information is visible, how results are ranked, and what content is restricted — with little transparency.

- **Data Breaches & Misuse**  
  Centralized databases are high-value targets for hackers. Even without breaches, user data may be shared with advertisers, governments, or third parties.

- **Loss of Ownership**  
  Once uploaded, personal data often remains stored indefinitely and may be used to train proprietary AI models without compensation or user control.

- **Chilling Effects & Surveillance**  
  Knowing interactions are constantly monitored leads to self-censorship and reduced freedom of expression.

---

**DAISY** is a decentralized blockchain platform built on Algorand to counter these risks by:

- Using a **token-based economy** (DAISY ASA) to incentivize rerouting of search queries via proxy nodes.
- Allowing anyone to run or verify an **indexer/validator** (backed by VRF and PPoS (future work)), ensuring no single entity controls knowledge access.
- Giving users **true ownership** over their interactions, with cryptographic receipts for accountability.

By decentralizing search, we return **privacy, transparency, and control** back to the community — not corporations.


This repository contains a reference implementation of a **trust-minimized search marketplace** on Algorand. 
Users post queries, indexers answer, and payments settle using a dedicated Algorand Standard Asset (ASA), **DAISY**. 
Smart contracts (ARC-4 app) coordinate escrow & settlement; an off-chain AI/indexer node performs retrieval + ranking; 
a client library makes it easy to integrate with frontends or scripts.

---

## 🧱 Architecture Overview

```
Prompt.py / Frontend (web)           Off-chain node ai_node.py
                                  │
  ┌──────────────┐                │  ┌───────────────────────┐
  | client.py    |                |    ai_node.py            |
  | (helpers)    |                │  | - watches app events  |
  └──────────────┘                │  | - answers queries     |
          │                       │  | - submits responses   |
          │                       │  └───────────────────────┘
          │ App Call / Query      │
          ▼                       │
   ┌───────────────────────────┐  │
   | Algorand ARC-4 App        │◀─┘  (escrow, deadlines, settlement)
   | (contract.py)             │
   └───────────────────────────┘

   ┌───────────────────────────┐
   | Algorand ASA (DAISY token)|  (payments & staking)
   └───────────────────────────┘

deploy.py (To deploy the contract on the algorand chain)
```

**Flow**
1. **User posts Query** (client/frontend → `postQuery`) with fee escrowed in DAISY.
2. **AI/Indexer observes** `QueryCreated` event, retrieves data (on/off-chain), and composes an answer.
3. **AI/Indexer submits Response** (`submitResponse`) attaching content hash, URI, and signature receipt.
4. **User accepts**  response (`acceptResponse`) → contract pays indexer in DAISY.
5. **Timeout path** (`timeoutReclaim`) lets the user reclaim escrow if no acceptable response arrives in time (to be implemented)

Cryptographic receipts (hash + signature) allow clients to verify answer provenance; payloads stay off-chain (IPFS/HTTP) with on-chain hashes for integrity.

---

## 📁 Project Layout

- `contract.py` — ARC-4 smart contract logic for the DAISY protocol (escrow, settlement, events).
- `deploy.py` — Deployment utilities: compile/deploy app + ASA; output IDs and addresses.
- `client.py` — High-level helpers for algod/indexer access and app call composition.
- `ai_node.py` — Reference off-chain worker that watches events, generates answers (using `prompt.py`), and submits responses.
- `prompt.py` — Prompt templates and helpers for AI retrieval/answering.


---

## 🔐 Security & Ops Notes

- **Fee model:** DAISY handles economic incentives; **ALGO** L1 fees must still be paid by the outer transaction sender (user or relayer).
- **Relayer option:** For “DAISY-only gas,” operate a relayer that pays ALGO fees and is reimbursed in DAISY on-chain.
- **CORS & tokens:** Never ship node tokens to the browser; use a proxy (serverless or Express) for Indexer/algod.
- **Receipts:** Always attach `contentHash` (e.g., SHA-256) and an ed25519 signature covering `(queryId || hash || requester)`.

---

## 🧪 Local Development

1. Start an Algorand LocalNet (Algokit or sandbox) and fund test accounts.
2. Run `deploy.py` to deploy the ASA and contract; note **APP_ID** and **ASA_ID**.
3. Configure the `ai_node.py` settings
4. Start the AI node to listen for queries and submit answers.
5. Prompt using prompt.py to post queries and accept responses in a DB or directly (IFPS/Nillon DB to handle search contexts and chat continuity still in process.)
6. 'algo_top_up.py' and 'daisy_top_up.py' allow refilling of algos and daisys for further testing into USER, and PROVIDER accounts. It can also be changed to reffill smart contract accounts by changing USER ADDRESS to the respective account.

---

## Future Work
Future work includes testing with multiple AI nodes on TestNet using algorithms such as VRF and PPoS to back it up.
Highly secure DB infrastructure like IFPS or Nillon DB to also be integrated. This will allow log entries for Queries and Prompts storing their CID/Refs to these DBs eliminating the need for BoxMaps. This will keep a stable Minimum Balance Required(MBR) and make the solution highly scalable without a large amounts of funds being held.











