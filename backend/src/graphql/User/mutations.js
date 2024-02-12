export const mutations = `#graphql
    createUser(User: UserInput) : User

    loginUser(username : String, email : String, password : String!) : String

    updateUserRole(id : Int!, role : UserRole!) : String


    getUserById(id : Int!) : User
`
