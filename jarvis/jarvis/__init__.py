"""Jarvis — system zarządzania operacjami Fundacji Szansa AI.

Zasada nadrzędna: ŻADNA akcja zmieniająca stan (zapis do bazy, wysyłka
e-maila, publikacja posta, płatność) nie wykonuje się automatycznie.
Każda przechodzi przez bramkę zatwierdzenia (jarvis.approval) i czeka
na jawną zgodę operatora [T/N].
"""

__version__ = "0.1.0"
