# SIERRA: A Visual Graph Query Interface for property graphs

## Running the Project

First, enter the configuration details in ./config/webpack.common.js (lines 123-127). Key in the corresponding details of the database you wish to run, such as the following example.

```
new webpack.EnvironmentPlugin({
  NEO4J_URI: 'bolt://localhost:7687',
  NEO4J_DATABASE: 'Northwind',
  NEO4J_USER: 'neo4j',
  NEO4J_PASSWORD: 'password',
  NEO4J_VERSION: '',
}),

```

Then, start running the database on Neo4j. Ensure that the database is active as shown in the following figure:

![image](https://user-images.githubusercontent.com/44084459/114523240-b31c9180-9c76-11eb-898c-050a8adcb899.png)

Firstly, build the docker image using the command

```sh
$ docker build -t fyp/sierra .
```

Next, run the docker image using

```sh
$ docker run -d -it -p 3000:3000 --name sierra fyp/sierra:latest
```

The application will start running at http://localhost:3000/.

## Project Structure

```
.
├── config                   # Webpack and Jest configuration
├── public                   # Static public assets (not imported anywhere in source code)
│   └── index.html           # Main HTML page template for app
├── src                      # Application source code
│   ├── assets               # Assets such as images
│   ├── components           # Global Reusable Components
│   ├── App.jsx              # App Component, the main component which acts as a container for all other components.
│   ├── App.css              # Application-wide styles and theme
│   ├── constants.js         # Global Reusable Components
│   ├── neo4jApi.js          # Back-end logic to run queries on underlying property graph
│   ├── Reducer.js           # Reducer to modify global state
│   ├── Store.js             # Global store to keep track of state
|   ├── ...
|   ├── index.jsx            # Application bootstrap and rendering with store
└── static                   # Static public assets imported anywhere in source code
```
