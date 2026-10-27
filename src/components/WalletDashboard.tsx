"use client";

import { useEffect, useMemo, useState } from "react";
import { useConnect, useConnections, useConnectors, useDisconnect, usePublicClient } from "wagmi";
import { isAddress, type Address } from "viem";

type WatchedAccount = {connectorUid:string; wallet:string; address:Address; chainId:number};
type ConnectorWithIcon = { uid:string; name:string; icon?:string };

function ConnectorIcon({ connector }: { connector: ConnectorWithIcon }) {
  const fallback = connector.name.slice(0, 1).toUpperCase();

  if (connector.icon) {
    return (
      <img
        className="connector-icon"
        src={connector.icon}
        alt=""
        aria-hidden="true"
      />
    );
  }

  return <span className="connector-icon connector-icon-fallback" aria-hidden="true">{fallback}</span>;
}

export default function WalletDashboard() {
  const connectors = useConnectors();
  const connections = useConnections();
  const {connect, isPending, error} = useConnect();
  const {disconnect} = useDisconnect();
  const client = usePublicClient();
  const [watched, setWatched] = useState<WatchedAccount[]>([]);
  const [walletUid,setWalletUid] = useState("");
  const [address,setAddress] = useState("");
  const [selected,setSelected] = useState<string[]>([]);
  const [balances,setBalances] = useState<Record<string,string>>({});
  const [message,setMessage] = useState("");

  const entries = useMemo(() => {
    const map = new Map<string, WatchedAccount & {id:string;canSign:boolean}>();
    const insert = (a:WatchedAccount) => {
      const id = [a.connectorUid,a.chainId,a.address.toLowerCase()].join(":");
      const connection = connections.find(c => c.connector.uid === a.connectorUid);
      map.set(id, {...a,id,canSign: !!connection &&
        connection.chainId === a.chainId &&
        connection.accounts[0]?.toLowerCase() === a.address.toLowerCase()});
    };
    watched.forEach(insert);
    connections.forEach(c => c.accounts.forEach(a =>
      insert({connectorUid:c.connector.uid,wallet:c.connector.name,address:a,chainId:c.chainId})));
    return [...map.values()];
  }, [watched, connections]);

  // Only look up balances for the public client network. No wallet authority is needed.
  useEffect(() => {
    if (!client) return;
    let cancelled = false;
    Promise.all(entries.filter(a=>a.chainId===client.chain.id).map(async a=>{
      try {
        const wei = await client.getBalance({address:a.address});
        return [a.id,(Number(wei)/1e18).toFixed(6)] as const;
      } catch {return [a.id,"Unavailable"] as const;}
    })).then(result=>{if (!cancelled) setBalances(Object.fromEntries(result));});
    return ()=>{cancelled=true};
  },[client,entries]);

  function addWatch() {
    const connection = connections.find(c=>c.connector.uid===walletUid);
    if (!connection) {setMessage("First connect the wallet extension.");return;}
    if (!isAddress(address)) {setMessage("Invalid EVM address.");return;}
    setWatched(prev=>[...prev.filter(a=>!(a.connectorUid===walletUid &&
      a.address.toLowerCase()===address.toLowerCase() && a.chainId===connection.chainId)),
      {connectorUid:walletUid,wallet:connection.connector.name,address:address as Address,chainId:connection.chainId}]);
    setAddress("");
    setMessage("Account registered for watch-only monitoring.");
  }

  return <main>
    <h1>Multi-Wallet + Multi-Account</h1>
    <p className="muted">Connect MetaMask, Trust Wallet, Rabby or other EIP-6963 wallets. Track multiple addresses. Signing is restricted to the extension-authorized account.</p>
    <section className="panel"><h2>1. Connect wallet extensions</h2>
      <div className="cards">{connectors.map(c=>{
        const connector = c as typeof c & ConnectorWithIcon;
        return <div className="card connector-card" key={c.uid}>
          <div className="connector-brand">
            <ConnectorIcon connector={connector} />
            <div>
              <strong>{c.name}</strong>
              <span className="caption">Wallet connector</span>
            </div>
          </div>
          <div><button disabled={isPending} onClick={()=>connect({connector:c})}>Connect</button></div>
        </div>;
      })}</div>{error&&<p className="warn">{error.message}</p>}
    </section>
    <section className="panel"><h2>2. Connected wallets</h2>
      {connections.length===0?<p className="muted">No wallet connected yet.</p>:connections.map(c=><div className="card connector-card" key={c.connector.uid}>
        <div className="connector-brand">
          <ConnectorIcon connector={c.connector as typeof c.connector & ConnectorWithIcon} />
          <div>
            <strong>{c.connector.name}</strong>
            <span className="caption">Chain {c.chainId} • {c.accounts.length} account{c.accounts.length === 1 ? "" : "s"}</span>
          </div>
        </div>
        <button onClick={()=>disconnect({connector:c.connector})}>Disconnect</button>
      </div>)}
    </section>
    <section className="panel"><h2>3. Add another address under a wallet</h2>
      <p className="caption">Adding an address does NOT authorize it to sign transactions.</p>
      <select value={walletUid} onChange={e=>setWalletUid(e.target.value)}>
        <option value="">Choose a connected wallet</option>
        {connections.map(c=><option key={c.connector.uid} value={c.connector.uid}>{c.connector.name}</option>)}
      </select>
      <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="0x... public address"/>
      <button onClick={addWatch}>Register address</button><p role="status">{message}</p>
    </section>
    <section className="panel"><h2>4. Managed accounts</h2>
      {entries.length===0?<p className="muted">Connect and register accounts to begin.</p>:entries.map(a=><div className="account" key={a.id}>
        <label><input type="checkbox" checked={selected.includes(a.id)} onChange={e=>setSelected(old=>e.target.checked?[...old,a.id]:old.filter(x=>x!==a.id))}/>
          <strong>{a.wallet}</strong> — {a.canSign?<span className="ok">Active signer candidate</span>:<span className="warn">Watch-only / switch required</span>}
        </label>
        <div className="address">{a.address}</div>
        <div className="caption">Chain {a.chainId} • Native balance: {a.chainId===client?.chain.id?(balances[a.id]??"Loading..."):"Change read network"} </div>
      </div>)}
      <p><strong>{selected.length}</strong> accounts selected for a future route plan.</p>
      <p className="caption">No swap or multi-account transaction signing is implemented in this demonstration.</p>
    </section>
  </main>;
}
