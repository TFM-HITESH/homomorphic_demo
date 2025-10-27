# Risk Scoring Tests

This document provides example calculations for the risk scoring model, both in plaintext and using homomorphic encryption with a toy key set for demonstration.

## Model Features and Weights

The risk score is a weighted sum of the following features:

| Feature                  | Weight |
| ------------------------ | ------ |
| Age                      | 0.2    |
| BMI                      | 0.3    |
| Systolic Blood Pressure  | 0.2    |
| Diastolic Blood Pressure | 0.2    |
| Cholesterol              | 0.1    |

**Formula:** `Score = (Age * 0.2) + (BMI * 0.3) + (Systolic BP * 0.2) + (Diastolic BP * 0.2) + (Cholesterol * 0.1)`

---

## Patient Profiles and Normal Calculation

### 1. "Good" Patient Profile

- **Age:** 30
- **BMI:** 22
- **Systolic BP:** 110
- **Diastolic BP:** 70
- **Cholesterol:** 180

**Calculation:**
`(30 * 0.2) + (22 * 0.3) + (110 * 0.2) + (70 * 0.2) + (180 * 0.1)`
`= 6 + 6.6 + 22 + 14 + 18 = 66.6`

### 2. "Bad" Patient Profile

- **Age:** 65
- **BMI:** 35
- **Systolic BP:** 160
- **Diastolic BP:** 95
- **Cholesterol:** 240

**Calculation:**
`(65 * 0.2) + (35 * 0.3) + (160 * 0.2) + (95 * 0.2) + (240 * 0.1)`
`= 13 + 10.5 + 32 + 19 + 24 = 98.5`

---

## Homomorphic Calculation Example (Good Patient)

This demonstrates how the calculation can be performed on encrypted data without the server ever seeing the original values.

### 1. Toy Paillier Key Generation

For simplicity, we use moderately large prime numbers to generate our keys. In a real application, these would be much larger to ensure security and precision.

- `p = 10007`, `q = 10009`
- `n = p * q = 100160063`
- `g = n + 1 = 100160064`
- **Public Key (n, g):** `(100160063, 100160064)`
- `lambda = lcm(p-1, q-1) = 50070024`
- `mu = (L(g^lambda mod n^2))^-1 mod n = 33373343`
- **Private Key (lambda, mu):** `(50070024, 33373343)`

### 2. Encoding and Encryption (Client-Side)

The client encodes the feature values and weights as integers and encrypts the features. To handle floating-point weights, we use a `wscale` of 100. For this example, we use a feature `scale` of 1.

- **Features (m):** `[30, 22, 110, 70, 180]`

  - Since `n` is large enough, no modulo reduction is needed.
  - **Encoded Features:** `[30, 22, 110, 70, 180]`

- **Integer Weights (k):** `[20, 30, 20, 20, 10]` (Weights `[0.2, 0.3, ...]` multiplied by `wscale=100`)

The client encrypts each encoded feature `m` using `c = paillier_encrypt(m)`. This involves a random number `r`, so the ciphertext `c` will be different each time. We will represent the encrypted values conceptually as `E(m)`.

- **Encrypted Features:** `[E(30), E(22), E(110), E(70), E(180)]`

### 3. Homomorphic Calculation (Server-Side)

The server operates only on the encrypted ciphertexts.

- **Homomorphic Multiplication:** The server computes `E(m * k)` by calculating `e_mul_const(c, k)`. This gives a new set of ciphertexts representing each feature multiplied by its integer weight.

  - `E(30 * 20)`, `E(22 * 30)`, `E(110 * 20)`, `E(70 * 20)`, `E(180 * 10)`
  - `E(600)`, `E(660)`, `E(2200)`, `E(1400)`, `E(1800)`

- **Homomorphic Addition:** The server adds these results by multiplying the ciphertexts: `e_add(c1, c2)` which results in `E(m1 + m2)`.

  - `E(600) * E(660) * E(2200) * E(1400) * E(1800) = E(600 + 660 + 2200 + 1400 + 1800) = E(6660)`
  - The server now has a single ciphertext, `E(6660)`. It sends this back to the client.

### 4. Decryption (Client-Side)

The client receives the final encrypted score and decrypts it.

- **Decrypted Sum:** `paillier_decrypt(E(6660)) = 6660 mod n = 6660`.
- **Decode Score:** The client decodes the integer result by dividing by the scales used: `6660 / (scale * wscale) = 6660 / (1 * 100) = 66.6`

**Note on Precision:** The final score `66.6` matches the true score because the modulus `n` is sufficiently large to prevent wraparound or loss of precision. In a real-world scenario, `n` would be even larger (e.g., 2048 bits) to ensure security and exactness.
