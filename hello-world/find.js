const { prisma } = require('./generated/prisma-client');

async function main() {
	const user = await prisma.user({id:'ck3zg5j5d005l0837rujpsb3y'});
	console.log(user);

	const updateUser = await prisma.updateUser({
		where: {id:'ck3zg5j5d005l0837rujpsb3y'},
		data: { name: 'Bob'}
	});
	console.log(updateUser);

	const another = await prisma.users({
		where: {name: 'Bob'}
	});
	console.log(another);

	const postsByUser = await prisma.user({email: 'bob@test.com'}).posts();
	console.log(`All posts by that user:${JSON.stringify(postsByUser)}`);
};

main().catch(console.error);