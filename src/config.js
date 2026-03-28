export const CFG = {
  local: '192.168.0.169',
  ts:    'coolserver.oryx-cirius.ts.net',
  cf:    'bamwesa.org',
}

// Password: kevi1006 — to change, run in browser console:
// crypto.subtle.digest('SHA-256', new TextEncoder().encode('newpw'))
//   .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
export const PASSWORD_HASH = 'fac4b4004ef62f05c58c18c304faa52595bad500ac512090630036ab7d9146aa'
