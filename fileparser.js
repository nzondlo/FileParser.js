
var fs = require('fs');


/* Create filestream on .tsv file */
var myReader = fs.createReadStream(process.argv[2], { 
    flags: 'r',
    encoding: 'UTF-8',
    fd: null,
    mode: '0666',
    bufferSize: 64 * 1024,
    autoClose: true
});


/* rawData object to store relevant data */
var rawData = {
    hourHisto: {},
    cartHisto: {},
    numBought: 0,
    spentTotal: 0,
    countryHisto: { 
        "": 0
        },
    top3Countries: [],
    screenHisto: {},
    numEntries: 0,
    mostFrequentHour: "",
    mostPopularResultion: "",
    tempLine: ""
};

/* Checks if the parsed line of the data is the expected 44 or 45 characters */
function isLineLengthRight(length){

    return (length !== 45 && length !== 44)
}

/* Determines top 3 countries as we populate the country histogram */
function determineTop3(temp){
    
    rawData.top3Countries[0] = (rawData.top3Countries[0] || "");
    rawData.top3Countries[1] = (rawData.top3Countries[1] || "");
    rawData.top3Countries[2] = (rawData.top3Countries[2] || "");
    
    // If it's 1st, assign it.
    if (rawData.countryHisto[temp] >= rawData.countryHisto[rawData.top3Countries[0]]){
        
        rawData.top3Countries[0] = temp;
    
    // else if it's 2nd, assign it.
    } else if(rawData.countryHisto[temp] < rawData.countryHisto[rawData.top3Countries[0]] 
        && rawData.countryHisto[temp] >= rawData.countryHisto[rawData.top3Countries[1]]){
         
        rawData.top3Countries[1] = temp;
    
    // else if it's 3rd, assign it.
    } else if(rawData.countryHisto[temp] < rawData.countryHisto[rawData.top3Countries[1]] 
        && rawData.countryHisto[temp] >= rawData.countryHisto[rawData.top3Countries[2]]){
        
        rawData.top3Countries[2] = temp;
    }
}

/* Extract relevant data from temporary array chunk */
function extractData(arr){
    
    rawData.numEntries += arr.length;
    
    arr.forEach(function(element, index){
	
        var lineArr = element.split(/[\t]/);
        var temp;

        // Hour started shopping
        temp = lineArr.shift().slice(11,13);
        rawData.hourHisto[temp] = (rawData.hourHisto[temp] || 0);
        rawData.hourHisto[temp] += 1;
        
        rawData.mostFrequentHour = (rawData.mostFrequentHour || temp);
        if (rawData.hourHisto[temp] > rawData.hourHisto[rawData.mostFrequentHour])
            rawData.mostFrequentHour = temp;
	
        // Cart-add
        temp = lineArr.shift();
        rawData.cartHisto[temp] = (rawData.cartHisto[temp] || 0);
        rawData.cartHisto[temp] += 1;
	
        // Made Purchase
        temp = lineArr.shift();
        if (temp === '1') rawData.numBought += 1;
	
        // Total amount spent
        rawData.spentTotal += +lineArr.shift();
	
        // Country shopped from
        temp = lineArr.shift();
        rawData.countryHisto[temp] = (rawData.countryHisto[temp] || 0);
        rawData.countryHisto[temp] += 1;
        determineTop3(temp);
	
        // Screen resolution
        temp = lineArr.shift() + " x " + lineArr.shift();
        rawData.screenHisto[temp] = (rawData.screenHisto[temp] || 0);
        rawData.screenHisto[temp] += 1;
        
        rawData.mostPopularResolution = (rawData.mostPopularResolution || temp);
        if (rawData.screenHisto[temp] > rawData.screenHisto[rawData.mostPopularResolution])
            rawData.mostPopularResolution = temp;
	
	});
    
}

/* When data chunk is ready, event */
myReader.on('data', function(data){

    // Convert chunk from fileStream into a tempArray we can manipulate
	var tempArray = data.split(/[\n]/);
    
    // If last element of tempArray is empty, get rid of it
    if(tempArray[tempArray.length - 1] === "") tempArray.pop();
    
    // concat stored temporary entry data to first entry of array if its
    //      length is not what we expect
    if(isLineLengthRight(tempArray[0].length)){  
        rawData.tempLine += tempArray.shift();
        tempArray.push(rawData.tempLine);
        rawData.tempLine = "";
    }
    
    // pop() and store partial entry if it's not the size we expect
    if(isLineLengthRight(tempArray[tempArray.length - 1].length))
        rawData.tempLine = tempArray.pop();
    
    // extract relevant data from our array
	extractData(tempArray);
    
});


/* When end of file (EOF) event is triggered, display data */
myReader.on('end', function(){
    
    rawData.spentTotal = Math.round(rawData.spentTotal*100)/100;
    var hourFormat= ""; 
    (+rawData.mostFrequentHour < 12) ? hourFormat = ":00am" : hourFormat= ":00pm";
    console.log("1) Most frequented hour: " + rawData.mostFrequentHour
        + hourFormat);
    
    console.log("2) Percent of visitors that added anything to their shopping cart: "
        + (rawData.cartHisto["true"] / rawData.numEntries)*100 + "%");
    
    console.log("3) Top 3 countries visitors came from:\n\n"
        + "    #1 " + rawData.top3Countries[0] + "\n"
        + "    #2 " + rawData.top3Countries[1] + "\n"
        + "    #3 " + rawData.top3Countries[2] + "\n");
    
    console.log("4) Most popular screen resolution: " + rawData.mostPopularResolution);
        
    console.log("5) Money spent by all visitors: " + rawData.spentTotal);
    
    var temp = Math.round((rawData.spentTotal / rawData.numEntries)*100)/100;
    if (temp < 1) temp = "0" + temp;
    console.log("6) Average amount spent per visitor: $" + temp );
    
    temp = Math.round((rawData.spentTotal / rawData.numBought)*100)/100;
    if (temp < 1) temp = "0" + temp;
    console.log("7) Average amount by visitors that made a purchase: $" + temp);

        
});