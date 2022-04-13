#!/usr/bin/env python3
from hypothesis import given, example, assume
from hypothesis.strategies import text, integers
from hash import hash

# * Es determinista, una misma entrada siempre produce una misma salida.
# * Dos entradas diferentes no pueden producir la misma salida.
# * Un cambio pequeño en la entrada producirá una salida totalmente diferente como para que no se pueda hacer una correlación de las entradas.
# * La longitud del hash resultante es siempre la misma.

# Tests:
@given(text())
def test_hash_is_always_the_same_given_the_same_input(text):
    assert hash(text) == hash(text)


@given(text(), text())
def test_hash_is_different_for_each_input(text1, text2):
    assume(text1 != text2)
    assert hash(text1) != hash(text2)


@given(text())
def test_hash_has_always_the_same_fixed_length(text):
    assert len(hash(text)) == 10
