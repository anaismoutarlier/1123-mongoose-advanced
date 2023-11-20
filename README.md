### Mongoose / MongoDB Advanced Techniques: User / Post DB

This project shows how to create advanced schemas and use advanced techniques included in the library _Mongoosejs_ to manipulate a _MongoDB_ NoSQL database.

Our database will have two collections: **users** and **posts**. The posts collection contains sub-documents representing **comments**.

To get started,

1. Create a MongoDB database via MongoDB Atlas.

2. Create a `.env` file with a connection string for your database:

```
MONGODB_URI=""
```

3. Populate your **user** and **post** collections with mock data with the following command:

```bash
yarn setup
```

4. Start the development server from the terminal with the following command:

```bash
yarn dev
```
