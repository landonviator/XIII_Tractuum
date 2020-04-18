const path = require('path');
const Max = require('max-api');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let target;
let popmax;
let mutationRate;
let population;
let inputTarget = "";
let myfitness;
var generationCount = 1;



// This will be printed directly to the Max console
Max.post(`Loaded the ${path.basename(__filename)} script`);

// Use the 'addHandler' function to register a function for a particular message
Max.addHandler("bang", () => {
	Max.post("Who you think you bangin'?");
});

// Use the 'outlet' function to send messages out of node.script's outlet
Max.addHandler("echo", (msg) => {
	Max.outlet(msg);
});

Max.addHandler("setup", (msg) => {
	Max.outlet(msg);
	setup();

});

Max.addHandler("genetic", (msg) => {
	Max.outlet(msg);
	genetic();
});

Max.addHandler("calcfitness", (msg) => {
	Max.outlet(msg);
	calcfitness();
});

Max.addHandler("evaluateMembers", (msg) => {
	Max.outlet(msg);
	evaluateMembers();
});

Max.addHandler("setTarget", (msg) => {
	
	inputTarget = `${msg}`;
	});

Max.addHandler("assignFitness", (msg) => {
	
	myfitness = `${msg}`;
	population.receiveFitness(myfitness);
	});

rl.on('line', function(line){
	//inputTarget = (`{line}`);
	//Max.post (line);

});

function setup() {
	//var initialC = 19522.25;
	
	target = inputTarget;
	popmax = 10;
	mutationRate = 0.01;
	
	// Create a population with a target phrase, mutation rate, and population max
	population = new Population(target, mutationRate, popmax);
}



function genetic() {
	// Generate mating pool
	population.naturalSelection();
	//Create next generation
	population.generate();
	
	population.getMaxFitness();
	}


  // The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Genetic Algorithm, Evolving Shakespeare

// A class to describe a population of virtual organisms
// In this case, each organism is just an instance of a DNA object

class Population {
	constructor(p, m, num) {
  
	  this.population; // Array to hold the current population
	  this.matingPool; // ArrayList which we will use for our "mating pool"
	  this.generations = 0; // Number of generations
	  this.finished = false; // Are we finished evolving?
	  this.target = p; // Target phrase
	  this.mutationRate = m; // Mutation rate
	  this.perfectScore = 1;
  
	  this.best = "";
  
	  this.population = [];
	  for (let i = 0; i < num; i++) {
		this.population[i] = new DNA(this.target.length);
	  }
	  this.matingPool = [];
	  this.count = 0;
	  this.getMaxFitness();
	}
  
	// Fill our fitness array with a value for every member of the population
	getMaxFitness(){
		Max.outlet(this.population[this.count].genes.join(""));
	}

	receiveFitness(fit){
		this.population[this.count].fitness = fit;
		this.count++;
		if (this.count != this.population.length)
		{
			this.getMaxFitness();
		}
		else{
			this.count = 0;
			this.evaluate();
			//count how many times this function has been called
			generationCount++;
			Max.outlet('Generation ' + generationCount + ' Is Done!');
		}
	}
  
	// Generate a mating pool
	naturalSelection() {
	  // Clear the ArrayList
	  this.matingPool = [];
  
	  let maxFitness = 0;
	  for (let i = 0; i < this.population.length; i++) {
		if (this.population[i].fitness > maxFitness) {
		  maxFitness = this.population[i].fitness;
		}
	  }
  
	  // Based on fitness, each member will get added to the mating pool a certain number of times
	  // a higher fitness = more entries to mating pool = more likely to be picked as a parent
	  // a lower fitness = fewer entries to mating pool = less likely to be picked as a parent
	  for (let i = 0; i < this.population.length; i++) {
  
		// let fitness = map(this.population[i].fitness, 0, maxFitness, 0, 1);
		let fitness = this.population[i].fitness / maxFitness;
		let n = Math.floor(fitness * 100); // Arbitrary multiplier, we can also use monte carlo method
		for (let j = 0; j < n; j++) { // and pick two random numbers
		  this.matingPool.push(this.population[i]);
		}
	  }
	}
  
	// Create a new generation
	generate() {
	  // Refill the population with children from the mating pool
	  for (let i = 0; i < this.population.length; i++) {
		let a = Math.floor(Math.random() * (this.matingPool.length));
		let b = Math.floor(Math.random() * (this.matingPool.length));
		let partnerA = this.matingPool[a];
		let partnerB = this.matingPool[b];
		let child = partnerA.crossover(partnerB);
		child.mutate(this.mutationRate);
		this.population[i] = child;
	  }
	
	  this.generations++;
	}
  
  
	getBest() {
	  return this.best;
	}
  
	// Compute the current "most fit" member of the population
	evaluate() {
	  let worldrecord = 0.0;
	  let index = 0;
	  for (let i = 0; i < this.population.length; i++) {
		if (this.population[i].fitness > worldrecord) {
		  index = i;
		  worldrecord = this.population[i].fitness;
		}
	  }
  
	  this.best = this.population[index].getPhrase();
	  if (worldrecord === this.perfectScore) {
		this.finished = true;
	  }
	
	}
  
	isFinished() {
	  return this.finished;
	
	
	}
  
	getGenerations() {
	  return this.generations;
	}
  
	// Compute average fitness for the population
	getAverageFitness() {
	  let total = 0;
	  for (let i = 0; i < this.population.length; i++) {
		total += this.population[i].fitness;
	  }
	  return total / (this.population.length);
	}
  
	allPhrases() {
	  let everything = "";
  
	  let displayLimit = min(this.population.length, 50);
  
  
	  for (let i = 0; i < displayLimit; i++) {
		everything += this.population[i].getPhrase() + "<br>";
	  }
	  return everything;
	}
  }

  // The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// Genetic Algorithm, Evolving Shakespeare

// A class to describe a pseudo-DNA, i.e. genotype
//   Here, a virtual organism's DNA is an array of character.
//   Functionality:
//      -- convert DNA into a string
//      -- calculate DNA's "fitness"
//      -- mate DNA with another set of DNA
//      -- mutate DNA

function newChar() {
	
let c = Math.floor(Math.random() * 10 + 48);
//let c = Math.random() * 10;
//if (c === 47) c = 46;

return String.fromCharCode(c);		

}

// Constructor (makes a random DNA)
class DNA {
constructor(num) {
	// The genetic sequence
	this.genes = [];
	this.fitness = 0;
	for (let i = 0; i < num; i++) {
	this.genes[i] = newChar(); // Pick from range of chars
	}
}

// Converts character array to a String
getPhrase() {
	return this.genes.join("");
}

// Crossover
crossover(partner) {
	// A new child
	let child = new DNA(this.genes.length);

	let midpoint = Math.floor(Math.random() * (this.genes.length)); // Pick a midpoint

	// Half from one, half from the other
	for (let i = 0; i < this.genes.length; i++) {
	if (i > midpoint) child.genes[i] = this.genes[i];
	else child.genes[i] = partner.genes[i];
	}
	return child;
}

// Based on a mutation probability, picks a new random character
mutate(mutationRate) {
	for (let i = 0; i < this.genes.length; i++) {
	if (Math.random() * (1) < mutationRate) {
		this.genes[i] = newChar();
	}
	}
}
}