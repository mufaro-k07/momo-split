# MomoSplit 📱💰

**Your Mobile Money Transaction Organiser**

MomoSplit is a lightweight web application designed to help small business owners in Rwanda separate personal and business Mobile Money (MoMo) transactions. Built with pure vanilla JavaScript, HTML, and CSS—no frameworks, no dependencies.

---

## 🎯 Problem Statement

Many small business owners face a common challenge: MTN MoMo merchant payments and personal payments arrive in the same inbox, making it difficult to:
- Track business inflows vs personal inflows
- Monitor overall cashflow
- Maintain clear financial records
- Prepare for tax reporting or business analysis

**MomoSplit solves this** by providing an intuitive interface to classify, filter, and analyze your MoMo transactions.

---

## ✨ Features

- **Transaction Classification**: Automatically categorize transactions as business or personal
- **Smart Filtering**: Filter by transaction type (business/personal/all)
- **Advanced Sorting**: Sort by date, amount, name, or transaction type
- **Search Functionality**: Quickly find specific transactions by name or description
- **Cashflow Tracking**: Clear visualization of inflows and outflows
- **Clean Tabular View**: See all transaction details at a glance (name, description, amount, type, date)
- **External API Integration**: Fetches real transaction data from external sources
- **Offline Fallback**: Works with local data if API is unavailable
- **Responsive Design**: Works seamlessly on desktop and mobile devices

---

## 🏗️ Project Architecture

This project strictly adheres to assignment requirements: **no frameworks, no external JavaScript libraries**.

### Technology Stack

**Frontend:**
- Pure HTML5
- Vanilla CSS3
- Vanilla JavaScript (ES6+)

**Backend / Data Source:**
- External REST API (MockAPI / GitHub Raw JSON)
- Local fallback JSON embedded in `app.js`

**Deployment:**
- Static deployment on NGINX web server
- Load-balanced configuration across two servers (optional)

**Dependencies:**
- ✅ None! Zero npm packages, zero CDN imports

---

## 🌐 External API Integration

MomoSplit fetches transaction data from an external API endpoint:

```
API Endpoint: [Your API URL here]
Method: GET
Response Format: JSON
```

**Fallback Mechanism:** If the API fails or is unreachable, the app automatically switches to local sample data to ensure uninterrupted functionality.

This fulfills the assignment requirement for *"integration with an external API not hosted by the student"*.

---

## 📁 Project Structure

```
momosplit/
├── index.html          # Main HTML structure
├── styles.css          # All styling (no CSS frameworks)
├── app.js              # Core application logic
├── README.md           # This file
└── assets/             # Images, icons (if any)
```

---

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- NGINX web server (for deployment)
- Internet connection (for API access)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone [your-repo-url]
   cd momosplit
   ```

2. **Open in browser:**
   Simply open `index.html` in your web browser:
   ```bash
   open index.html
   # or
   firefox index.html
   ```

3. **Or use a local server:**
   ```bash
   python3 -m http.server 8000
   # Then visit http://localhost:8000
   ```

### Production Deployment (NGINX)

1. **Copy files to web server:**
   ```bash
   sudo cp -r momosplit/ /var/www/html/
   ```

2. **Configure NGINX:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/html/momosplit;
       index index.html;

       location / {
           try_files $uri $uri/ =404;
       }
   }
   ```

3. **Restart NGINX:**
   ```bash
   sudo systemctl restart nginx
   ```

---

## 💻 Usage

1. **View Transactions**: The app loads and displays all transactions automatically
2. **Filter by Type**: Click the filter buttons to show only business, personal, or all transactions
3. **Sort Data**: Click column headers to sort by that field (date, amount, name, type)
4. **Search**: Use the search bar to find specific transactions by name or description
5. **Monitor Cashflow**: Check the summary panel for total inflows and outflows

---

## 🎨 Design Decisions

### Why No Frameworks?
This project intentionally avoids frameworks to:
- Meet assignment requirements
- Demonstrate fundamental web development skills
- Keep the application lightweight and fast
- Minimize dependencies and security vulnerabilities

### Why External API?
Using an external API demonstrates:
- Real-world data integration skills
- Proper error handling and fallback mechanisms
- RESTful API consumption
- Asynchronous JavaScript (fetch, promises)

### Why NGINX?
NGINX provides:
- Fast static file serving
- Easy load balancing configuration
- Production-grade reliability
- Minimal resource footprint

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Transactions load from API successfully
- [ ] Fallback data loads when API fails
- [ ] Filter buttons work correctly
- [ ] Sorting functions properly on all columns
- [ ] Search returns accurate results
- [ ] Responsive design works on mobile
- [ ] All calculations (totals, cashflow) are correct

### Testing API Failure
To test the fallback mechanism, temporarily disable your internet connection or modify the API URL to an invalid endpoint.

---

##  Future Enhancements

- Date range filtering
- Monthly/yearly summary reports
- Charts and visualizations (using vanilla JS)
- Multi-currency support
- Transaction editing capabilities
- User authentication and data persistence

---

## 🐛 Known Issues

- Finding the right API to use because it involves financial data

---

##  Assignment Requirements Checklist

- [x] No frameworks used (pure HTML/CSS/JS)
- [x] Integration with external API
- [x] Proper error handling with fallback data
- [x] Clean, semantic HTML structure
- [x] Responsive CSS design
- [x] Modular JavaScript code
- [x] NGINX deployment configuration
- [x] Comprehensive README documentation

---

## 👨‍💻 Author

Mufaro Victoria Kunze  
m.kunze@alustudent.com  
African Leadership University BSc Software Engineering
**Course:** Web Infrastructure module

---

## 📄 License

This project is submitted as academic coursework. All rights reserved.

---

## 🙏 Acknowledgments

- MTN Rwanda for Mobile Money services that inspired this project
- Small business owners who face this challenge daily (e.g Southern Flames)

---

## Support

For questions or issues, please contact m.kunze@alustudent.com or open an issue in the repository.

**Built with ❤️ and vanilla JavaScript**