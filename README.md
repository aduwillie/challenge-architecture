# Backend/Architecture Challenge

## Problem statement
Implement a "document processing engine" in the form of microservices for the purpose of processing any type of PDF file that our customers may bring to our platform.

Specifically, we want to implement two microservices that extract the text and create preview images from an incoming document that needs to be processed.

### Goals

- able to scale to process thousands of documents in a short period of time
- simple to extend the pipeline with more steps(ex. today we extract the text and preview images, in the future we may want to extend it such that we train a machine learning model and then run predictions against the model)

### Implementation requirements

- Use Node.js and Typescript to implement the microservices
- (microservice #1) Implement a service to extract text from the PDF file and store it as a file in S3
- (microservice #2) Implement a service to extract preview images (up to the first 10 pages of the document) from the PDF file and store them in S3
- Use the [aws-sdk](https://www.npmjs.com/package/aws-sdk) to make use of the S3 and SQS emulators for file storage and queueing the different tasks

Optional:

- write a few tests(unit/integration) for the implementation
- integrate a monitoring service (either run it via docker or use a cloud service of your choice) and create a few alerts that you deem to be important

### Dependencies

- Docker
- node.js (and npm)
- Some knowledge of AWS S3 and AWS SQS

#### Implementation notes/ideas

There is an `AWS S3` and `AWS SQS` emulator running on ports `5000` and `5001` respectively. This is where you should store all files(PDF itself, text file, preview images) as well as queue the file processing using the `aws-sdk`. You can start the emulator using `docker-compose up -d aws`

There is also a service implemented in `/stream` that will randomly publish messages for files to be processed in SQS. You can start it using `docker-compose up -d stream`. The `QueueName` where it will publish to is `file-stream`. Here is an example of how you can receive messages from this queue:

```ts
const sqs = new SQS({ endpoint: 'http://localhost:5001' })
const { QueueUrl } = await sqs.getQueueUrl({ QueueName: 'file-stream' }).promise()
const { Messages } = await sqs.receiveMessage({ QueueUrl }).promise()
// Process and de-queue Messages
interface MessageBody {
  uid: string // a randomly generated uid
  Bucket: string // the S3 Bucket where the document can be downloaded from
  Key: string // the S3 key for the document PDF file
}
```

### Services Created
- stream (Document generator service)
- extract-text (Microservice #1)
- extract-image (Microservice #2)
- nats (Message Broker)
- prometheus (Metrics database)
- alert Manager (Send Notifications)
- nodeexporter (OS Metrics)
- cadvisor (Container Metrics)
- grafana (Visualize Metrics)
- pushgateway (Push acceptor for batch jobs)
- caddy (Reverse proxy and basic auth for prometheus and alertmanager)

## Getting Started

The project can be started using the command `docker-compose up -d`. If there's a need to rebuild the containers, use `docker-compose up -d --build`.

### Notes

To view the Grafana Dashboard, use http://<your-host>:3000
To access Prometheus Dashboard, use http://<your-host>:9090

Caddy Reverse Proxy has been configured to route traffic to:
- `:5005` --> Extract Text Service
- `:5006` --> Extract Image Service

For both `extract-text` and `extract-image` service, you can access all routes through `/api` (prefix) endpoint. Also the following routes can help you see stats about each of the the service:

```
  /api/~node/health  # Health info of node
  /api/~node/list  # List all actions
```

