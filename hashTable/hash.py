#!/usr/bin/env python3
import random

# Function under test:
def hash(text):
    random.seed(text)
    hash = str(random.random())
    return hash[0:10]


