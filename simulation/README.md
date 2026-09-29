# Simulation package

This boundary will contain deterministic synthetic topology generation and event simulation.

The first implementation must accept an explicit seed and configuration, produce the same identifiers and topology for the same inputs, and remain independent of Django so it can be tested without the API process. NetworkX and SimPy remain proposed until the documented validation spike is complete.
