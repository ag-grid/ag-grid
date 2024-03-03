i had trouble in-lining these files.

so now they are inlined with php, but are hacked as follows:
-> classes are renamed, so they don't clash
-> class applied to svg, to allow setting size

i also had to take the 'version' out of the xlm (the first line), otherwise hostgater complained when it was inlined.
