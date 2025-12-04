(define-non-fungible-token cns-name uint)

(define-data-var name-counter uint u0)
(define-data-var name-price uint u10000000) ;; 1 STX (in uSTX)

(define-map name-to-address {name-id: uint} {stacks-addr: principal, btc-addr: (optional (string-ascii 40))})
(define-map name-to-name-id {name: (string-ascii 20)} {id: uint})

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-NAME-ALREADY-REGISTERED (err u101))
(define-constant ERR-NAME-TOO-LONG (err u102))
(define-constant ERR-NAME-NOT-FOUND (err u103))

(define-private (get-next-name-id)
    (let ((next-id (+ (var-get name-counter) u1)))
        (var-set name-counter next-id)
        next-id
    )
)

;; SIP-009 NFT Standard Functions
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
    (begin
        (asserts! (is-eq tx-sender sender) ERR-NOT-AUTHORIZED)
        (ok (nft-transfer? cns-name token-id sender recipient))
    )
)

(define-read-only (get-owner (token-id uint))
    (ok (nft-get-owner? cns-name token-id))
)

(define-read-only (get-last-token-id)
    (ok (var-get name-counter))
)

(define-read-only (get-token-uri (token-id uint))
    (ok none)
)

;; Custom CNS Functions
(define-public (register-name (name (string-ascii 20)) (btc-address (optional (string-ascii 40))))
    (let
        ((sender tx-sender)
         (name-id (map-get? name-to-name-id {name: name})))
        
        ;; 1. Check if name is already registered
        (asserts! (is-none name-id) ERR-NAME-ALREADY-REGISTERED)

        ;; 2. Check name length (Example rule)
        (asserts! (> (len name) u2) ERR-NAME-TOO-LONG)

        ;; 3. Transfer STX payment (1 STX)
        (asserts! (try! (stx-transfer? (var-get name-price) sender (as-contract tx-sender))) ERR-NOT-AUTHORIZED)

        ;; 4. Mint NFT and store resolution data
        (let ((new-id (get-next-name-id)))
            (try! (nft-mint? cns-name new-id sender))
            (map-set name-to-address {name-id: new-id} {stacks-addr: sender, btc-addr: btc-address})
            (map-set name-to-name-id {name: name} {id: new-id})
            (ok new-id)
        )
    )
)

(define-read-only (resolve-name (name (string-ascii 20)))
    (let 
        ((name-entry (map-get? name-to-name-id {name: name})))
        (asserts! (is-some name-entry) ERR-NAME-NOT-FOUND)
        (let
            ((name-id (get id (unwrap-panic name-entry)))
             (resolution-data (map-get? name-to-address {name-id: name-id})))
            (ok resolution-data)
        )
    )
)
