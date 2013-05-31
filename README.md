Fileparser
====================

A few modules, functions in CoffeeSript

included:
    challenge.tsv (tab-spaced data file)
	fileparsr.js
	

Fileparser script uses the Node fs module's read stream, and is capable of reading in chunks as data becomes available.


This will work on any size file formatted the way challenge.tsv is.



To run, bring up a terminal/command prompt and type

```
node fileparser challenge.tsv
```

Output should be: 

```
1) Most frequented hour: 06:00am                                                                                                                                                                      
2) Percent of visitors that added anything to their shopping cart: 16.3%    
3) Top 3 countries visitors came from:                                                                                                                                                                
                                                                                                                                                                                                      
    #1 US                                                                                                                                                                                             
    #2 CA                                                                                                                                                                                             
    #3 AU                                                                                                                                                                                             
                                                                                                                                                                                                      
4) Most popular screen resolution: 1280 x 800                                                                                                                                                         
5) Money spent by all visitors: 921.65                                                                                                                                                                
6) Average amount spent per visitor: $00.92                                                                                                                                                           
7) Average amount by visitors that made a purchase: $102.41 
```