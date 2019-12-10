const { prisma } = require('./generated/prisma-client');

const main = async() => {
	const newUser = await prisma.createUser({
		name: 'Bob',
		email: 'bob@test.com',
		posts: {
			create: [
				{title: 'Join us for GraphQL Conf in 2019'},
				{title: 'Prisma 잘되네요'}
			]
		}
	});

	console.log(`Created New User: ${newUser.name} (ID: ${newUser.id})`);

	prisma.users().then(console.log);
	prisma.posts().then(console.log);
};

main().catch(console.error);