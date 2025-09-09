const UsersList = require('../models/product.model')

// Dummy user data
const dummyUsers = [
  {
    _id: "1",
    name: "Harsh Saini",
    email: "harsh@example.com",
    role: "Customer",
    isLoggedIn: true,
    lastLogin: new Date("2025-09-09T09:00:00"),
    lastLogout: null
  },
  {
    _id: "2",
    name: "Rohan Mehra",
    email: "rohan@example.com",
    role: "Customer",
    isLoggedIn: false,
    lastLogin: new Date("2025-09-08T14:30:00"),
    lastLogout: new Date("2025-09-08T16:00:00")
  },
  {
    _id: "3",
    name: "Anita Sharma",
    email: "anita@example.com",
    role: "Customer",
    isLoggedIn: true,
    lastLogin: new Date("2025-09-09T10:15:00"),
    lastLogout: null
  },
  {
    _id: "4",
    name: "Vikram Singh",
    email: "vikram@example.com",
    role: "Customer",
    isLoggedIn: false,
    lastLogin: new Date("2025-09-07T09:45:00"),
    lastLogout: new Date("2025-09-07T12:30:00")
  },
  {
    _id: "5",
    name: "Priya Kapoor",
    email: "priya@example.com",
    role: "Customer",
    isLoggedIn: true,
    lastLogin: new Date("2025-09-09T08:50:00"),
    lastLogout: null
  },
  {
    _id: "6",
    name: "Siddharth Jain",
    email: "siddharth@example.com",
    role: "Customer",
    isLoggedIn: false,
    lastLogin: new Date("2025-09-08T18:20:00"),
    lastLogout: new Date("2025-09-08T20:00:00")
  },
  {
    _id: "7",
    name: "Neha Gupta",
    email: "neha@example.com",
    role: "Customer",
    isLoggedIn: true,
    lastLogin: new Date("2025-09-09T11:05:00"),
    lastLogout: null
  },
  {
    _id: "8",
    name: "Amit Roy",
    email: "amit@example.com",
    role: "Customer",
    isLoggedIn: false,
    lastLogin: new Date("2025-09-06T15:10:00"),
    lastLogout: new Date("2025-09-06T17:45:00")
  },
  {
    _id: "9",
    name: "Kavita Joshi",
    email: "kavita@example.com",
    role: "Customer",
    isLoggedIn: true,
    lastLogin: new Date("2025-09-09T12:30:00"),
    lastLogout: null
  },
  {
    _id: "10",
    name: "Rakesh Verma",
    email: "rakesh@example.com",
    role: "Customer",
    isLoggedIn: false,
    lastLogin: new Date("2025-09-07T10:00:00"),
    lastLogout: new Date("2025-09-07T11:30:00")
  }
];



exports.listUsers = async (req, res) => {
    try {
        console.log('Fetching users list...')
        
        // Get page from query params or default to 1
        const page = parseInt(req.query.page) || 1
        
        res.render('users/userList', {
            title: 'List All Customers',
            users: dummyUsers || [],
            currentPage: page,
        })
    } catch(err) {
        console.error('Error fetching users:', err)
        res.render('users/userList', {
            title: 'List All Customers',
            users: [],
            currentPage: 1,
            error: 'Error loading users'
        })
    }
}