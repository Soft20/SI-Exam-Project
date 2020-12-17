const { Client, logger } = require('camunda-external-task-client-js');
// const open = require('open');

// configuration for the Client:
//  - 'baseUrl': url to the Process Engine
//  - 'logger': utility to automatically log important events
//  - 'asyncResponseTimeout': long polling timeout (then a new request will be issued)
const config = { baseUrl: 'http://localhost:8080/engine-rest', use: logger, asyncResponseTimeout: 10000 };

// create a Client instance with custom configuration
const client = new Client(config);

// susbscribe to the topic: 'order-accepted'
client.subscribe('order-accepted', async function({ task, taskService }) {
  // Put your business logic here

  // Get a process variable
  const price = task.variables.get('price');
  const approved = task.variables.get('approved');

  console.log(`Approval is ${approved} for an order with the price of ${price} DKK.`);

  // Complete the task
  await taskService.complete(task);
});

client.subscribe('order-declined', async function({ task, taskService }) {
    // Put your business logic here
    
    // Get a process variable
    const price = task.variables.get('price');
  
    console.log(`Order declined with the price of ${price} DKK.`);
  
    // Complete the task
    await taskService.complete(task);
  });