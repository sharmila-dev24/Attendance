const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const session=require("express-session");
const multer=require('multer');
const xlsx=require("xlsx")
const path=require("path")

const app = express();
const PORT = 5000;
const storage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,path.join(__dirname,"../uploads"))
  },
  filename:(req,file,cb)=>{
    cb(null,Date.now()+"-"+file.originalname)
  },
})
const upload=multer({storage:storage});
// Middleware

app.use(bodyParser.json());
app.use(cors({
  origin:'http://localhost:3000',
  methods:['GET','POST','PATCH','DELETE'],
  credentials:true
}));

app.use(session({
  secret:"mysecretkey",
  resave:false,
  saveUninitialized:false,
  cookie:{
    secure:false,
    httpOnly:true,
    samesite:"lax",
    maxAge:100*60*60*24
  }
}))


// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost", // Replace with your MySQL server host
  user: "root",      // Replace with your MySQL username
  password: "", // Replace with your MySQL password
  database: "attendance_project", // Replace with your database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.message);
  } else {
    console.log("Connected to MySQL database.");
  }
});
app.post("/import/:type",upload.single("file"),async(req,res)=>{
    const file=req.file;
    console.log(file)
    const {type}=req.params;
    console.log(type)
  
    if(!file) return res.status(400).send({message:"No file uploaded"})

    try{
      const workbook=xlsx.readFile(file.path);
      const sheet=workbook.Sheets[workbook.SheetNames[0]];
      const jsonData=xlsx.utils.sheet_to_json(sheet);

      let query="";
      let values=[];

      if(type==="workload"){
        query="insert into workload(faculty_id,day_order,hour,sub_code,class_code) values ?";
        values=jsonData.map(row=>[row.faculty_id,row.day_order,row.hour,row.sub_code,row.class_code])
      }else if(type==="student"){
        console.log("Im in student for uploading file")
        query="insert into student(Regno,name,Phone,Email,class_code) values ?";
        values=jsonData.map(row=>[row.Regno,row.name,row.Phone,row.Email,row.class_code])
        console.log(jsonData)
      }else if(type==="faculty"){
        query="insert into faculty(faculty_id,Name,Phone,Email,Designation) values ?";
        values=jsonData.map(row=>[row.faculty_id,row.Name,row.Phone,row.Email,row.Designation])
      }else if(type==="calender"){
        console.log("Im from calender uploading")
        query="insert into calender(date,day,remarks,day_order,current_workingday) values ?"
        values=jsonData.map(row=>[row.date,row.day,row.remarks,row.day_order,row.current_workingday])
        console.log(jsonData)
      }else{
         return res.status(400).send({message:"invalid importing"}) 
         }
        
        db.query(query,[values],(err,result)=>{
          if(err){
            console.error("database error",err.sqlMessage||err)
            return res.status(500).send({message:"error inserting data",error:err.sqlMessage||err})
          }
          res.send({message:"data imported successfully"})
        })
      } catch (error) {
        res.status(500).send({ message: "Error processing file", error: error.message });
    }
});

// Sample API to fetch data from a table
app.post("/api/register", (req, res) => {
    const {user_id,name,email,password,phone,role}=req.body;

    if(!user_id||!name||!email||!password||!phone||role==="select"){
        return res.status(400).json({sucess:false,message:"All fields are required!"})
    }
  const query = "insert into register(user_id,name,email,password,phone,role)values(?,?,?,?,?,?)";
  db.query(query, [user_id,name,email,password,phone,role],(err,results) => {
    if (err) {
      console.error("Error fetching data:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({message:"user registered successfully"});
    }
  });
});

app.post('/login',(req,res)=>{
    const {user_id,password}=req.body;
    req.session.user_id={user_id};
    console.log("login",req.session.user_id)
    console.log(req.body);
     
    const query='select role from register where user_id=? and password=?';
   
    db.query(query,[user_id,password],(err,results)=>{
        if(err) throw err;
        if(results.length>0){
            res.json({sucess:true,role:results[0].role});
        }else{
            res.status(401).json({success:false,message:'invalid credentials'});
        }
    });
});

app.post("/getWorkload", (req, res) => {
  faculty_id=req.session.user_id.user_id;
  const {date } = req.body;
  console.log(req.body);
  console.log("the faculty_id is",faculty_id);

  // Convert the date to a proper format if needed (e.g., YYYY-MM-DD)
  const formattedDate = new Date(date).toISOString().split("T")[0];

  //changes occured1.1
  const dayOrderQuery = `
  SELECT  w.day_order
  FROM workload w
  INNER JOIN calender c ON w.day_order = c.day_order
 
  WHERE c.date = ? AND w.faculty_id = ?
`;

db.query(dayOrderQuery, [formattedDate,faculty_id], (err, dayOrderResults) => {
  if (err) {
      console.error("Error fetching day_order:", err.message);
      return res.status(500).json({ error: "Failed to fetch day_order" });
  }

  if (dayOrderResults.length === 0) {
      return res.json({ message: "No data found for this date.", workload: [], day_order: null });
  }

  const dayOrder = dayOrderResults[0].day_order; // Assuming one unique day_order per date
  console.log("The day Order is",dayOrder);
   //INNER JOIN subject s on s.sub_code=w.sub_code

  const query = `
      SELECT w.hour, w.day_order, w.sub_code, w.class_code,w.day_order,f.name
      FROM workload w
      INNER JOIN calender c ON w.day_order = c.day_order
      INNER JOIN faculty f on w.faculty_id=f.faculty_id
      WHERE c.date = ?  AND w.faculty_id = ?`;
 
      
  db.query(query, [formattedDate,faculty_id], (err, results) => {
      if (err) {
          console.error("Error fetching workload:", err.message);
          res.status(500).json({ error: "Failed to fetch workload" });
      } else {
          res.json(results);
      }
  });
});
});


app.get("/getStudents/:classCode",(req,res)=>{
  const classCode=req.params.classCode;
  console.log(classCode)
  const query=`select Regno,name from student where class_code=?`;
  db.query(query,[classCode],(err,results)=>{
    if(err){
      console.error("error fetching students",err)
      return res.status(500).json({message:"Internal server error"})
    }
    res.json(results);
  })
})
app.post("/hours",async(req,res)=>{
  try{
    const {hour,class_code,attendance}=req.body;
    console.log({hour})
    if(!hour||!class_code||!attendance||!Array.isArray(attendance)){
      return res.status(400).json({message:"invalid request format"})
    }
    if(hour<1 || hour>5){
      return res.status(400).json({message:"Hour must be between 1 and 5"})
    }

    const hourColumn=`hour${hour}`
    console.log("hours",hourColumn)

    attendance.forEach(student=>{
      const {Regno,status}=student;

      db.query(
        `select*from attendance where Regno=? and date=CURDATE()`,
        [Regno],
        (err,rows)=>{
          if(err){
          console.error("error checking attedance record",err);
          return res.status(500).json({message:"Database error"})
          }
          if(rows.length>0){
            db.query(
              `Update attendance set ${hourColumn}=? where Regno=? and date=CURDATE()`,
              [status,Regno],
              (err)=>{
                if(err){
                  console.error("Error updating attendance",err)
                  return res.status(500).json({messsage:"Database update error"})
                }
              }
            );
          } else{
            db.query(
              `Insert into attendance (Regno,date,${hourColumn}) values (?,CURDATE(),?)`,
              [Regno,status],
              (err)=>{
                if(err){
                  console.error("Error inserting attendance",err)
                  return res.status(500).json({message:"Database insert error"})
                }
              }
            );
          }
        }
      )
    });
       
      res.json({message:`Attendance for hour ${hour} updated sucessfully`})
    }catch(error){
      console.error("Error updating attendance",error)
      res.status(500).json({message:"Internal server Error"});
    }
    });

    app.post("/hour", async (req, res) => {
      const { class_code, hour, attendance } = req.body;
      //const todayDate=new Date().toISOString().split("T")[0]
      try {
          for (const student of attendance) {
              const { Regno, status, date } = student; // status is now 1 or 0
             
              const existingRecord = await db.query(
                  "SELECT * FROM attendance WHERE Regno = ? AND date = ?",
                  [Regno, date]
              );
  
              if (existingRecord.length > 0) {
                  // Update existing record
                  await db.query(
                      `UPDATE attendance SET hour${hour} = ? WHERE Regno = ? AND date = ?`,
                      [status, Regno, date]
                  );
              } else {
                  // Insert new record
                  await db.query(
                      `INSERT INTO attendance (Regno, date, hour${hour}) VALUES (?, ?, ?)`,
                      [Regno, date, status]
                  );
              }
          }
  
          res.json({ message: "Attendance successfully submitted!" });
      } catch (error) {
          console.error("Error saving attendance:", error);
          res.status(500).json({ message: "Failed to save attendance." });
      }
  });
  
  app.get("/calenderss", (req, res) => {
    const sql = "SELECT DATE_FORMAT(date,'%Y-%m-%d') as date,day,remarks,day_order,current_workingday,academic_year from calender";
    db.query(sql, (err, results) => {
      if (err) {
        console.error("Error fetching calendar:", err);
        return res.status(500).json({ error: "Failed to fetch workload" });
      }
    
      res.json(results);

    });
  });

app.post("/calenders",(req,res)=>{
  const {date,day,remarks,day_order,current_workingday}=req.body;

  const sql="Insert into calender (date,day,remarks,day_order,current_workingday) values(?,?,?,?,?)"
 
  db.query(sql,[date,day,remarks,day_order,current_workingday],(err,result)=>{
    if(err){
      return res.status(500).json({error:"Failed to add entry"})
    }
    res.json({id:result.insertID,...req.body})
  })
})

app.patch("/calenders/:date", (req, res) => {
  const { date } = req.params;
  console.log("date",req.params)
  const updates = req.body; // Contains only the fields the admin wants to update
  console.log(req.body)
  // If no fields are provided, return an error
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No fields provided for update" });
  }

  // Construct the SQL query dynamically
  const fields = Object.keys(updates).map((key) => `${key}=?`).join(", ");
  const values = Object.values(updates);
  values.push(date); // Add date at the end for WHERE clause

  const sql = `UPDATE calender SET ${fields} WHERE date=?`;

  db.query(sql, values, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Failed to update entry" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }
    res.json({ message: "Entry updated successfully" });
  });
});

app.delete("/calenders/:date", (req, res) => {
  const { date } = req.params;
  const sql = "DELETE FROM calender WHERE date = ?";
  console.log("Im deleted")

  db.query(sql, [date], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error deleting entry" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.json({ message: "Entry deleted successfully" });
  });
});


app.get("/admin/staff",(req,res)=>{
  const sql="select * from faculty";
  db.query(sql,(err,results)=>{
    if(err){
      return res.status(500).json({error:"failed to fetch calender"})
    }
    res.json(results)
  })
})

app.post("/admin/staffs",(req,res)=>{
  const {faculty_id,Name,Phone,Email,Designation}=req.body;
  console.log(req.body)
  const sql="Insert into faculty (faculty_id,Name,Phone,Email,Designation) values(?,?,?,?,?)"
  
  db.query(sql,[faculty_id,Name,Phone,Email,Designation],(err,result)=>{
    if(err){
      return res.status(500).json({error:"Failed to add faculty"})
    }
    res.json({id:result.insertID,...req.body})
  })
})

app.patch("/admin/Staffs/:faculty_id", (req, res) => {
  const { faculty_id } = req.params;
  const updates = req.body;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  let sql = "UPDATE faculty SET ";
  const values = [];

  Object.keys(updates).forEach((key, index) => {
    sql += `${key} = ?`;
    if (index < Object.keys(updates).length - 1) {
      sql += ", ";
    }
    values.push(updates[key]);
  });

  sql += " WHERE faculty_id = ?";
  values.push(faculty_id);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating faculty:", err);
      return res.status(500).json({ error: "Failed to update faculty" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "faculty not found" });
    }
    res.json({ message: "faculty updated successfully" });
  });
});

// Delete a student (DELETE)
app.delete("/admin/Staff/:faculty_id", (req, res) => {
  const { faculty_id } = req.params;

  const sql = "DELETE FROM faculty WHERE faculty_id = ?";
  db.query(sql, [faculty_id], (err, result) => {
    if (err) {
      console.error("Error deleting faculty:", err);
      return res.status(500).json({ error: "Failed to delete faculty" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "faculty not found" });
    }
    res.json({ message: "faculty deleted successfully" });
  });
});

app.get("/admin/timetable", (req, res) => {
  const sql = "SELECT * FROM workload";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching workload:", err);
      return res.status(500).json({ error: "Failed to fetch workload" });
    }
    res.json(results);
  });
});

// ✅ POST (Add new workload entry)
app.post("/admin/timetable", (req, res) => {
  const { faculty_id, day_order, hour, sub_code, class_code } = req.body;

  if (!faculty_id || !day_order || !hour || !sub_code || !class_code) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = "INSERT INTO workload (faculty_id, day_order, hour, sub_code, class_code) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [faculty_id, day_order, hour, sub_code, class_code], (err, result) => {
    if (err) {
      console.error("Error adding workload:", err);
      return res.status(500).json({ error: "Failed to add workload" });
    }
    res.json({ id: result.insertId, ...req.body });
  });
});

// ✅ PATCH (Update workload entry)
app.patch("/admin/timetable/:faculty_id/:day_order/:hour", (req, res) => {
  const { faculty_id, day_order, hour } = req.params;
  const { sub_code, class_code } = req.body;

  if (!sub_code || !class_code) {
    return res.status(400).json({ error: "Fields cannot be empty" });
  }

  const sql = "UPDATE workload SET sub_code = ?, class_code = ? WHERE faculty_id = ? AND day_order = ? AND hour = ?";
  db.query(sql, [sub_code, class_code, faculty_id, day_order, hour], (err, result) => {
    if (err) {
      console.error("Error updating workload:", err);
      return res.status(500).json({ error: "Failed to update workload" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Workload entry not found" });
    }
    res.json({ message: "Workload updated successfully" });
  });
});

// ✅ DELETE (Remove workload entry)
app.delete("/admin/timetable/:faculty_id/:day_order/:hour", (req, res) => {
  const { faculty_id, day_order, hour } = req.params;

  const sql = "DELETE FROM workload WHERE faculty_id = ? AND day_order = ? AND hour = ?";
  db.query(sql, [faculty_id, day_order, hour], (err, result) => {
    if (err) {
      console.error("Error deleting workload:", err);
      return res.status(500).json({ error: "Failed to delete workload" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Workload entry not found" });
    }
    res.json({ message: "Workload deleted successfully" });
  });
});


app.get("/admin/Students",(req,res)=>{
  const sql="select * from student";
  db.query(sql,(err,results)=>{
    if(err){
      return res.status(500).json({error:"failed to fetch calender"})
    }
    res.json(results)
  })
})
app.post("/admin/Students",(req,res)=>{
  const {Regno,name,Phone,Email,class_code}=req.body;
  console.log(req.body)
  const sql="Insert into student(Regno,name,Phone,Email,class_code) values(?,?,?,?,?)"
  
  db.query(sql,[Regno,name,Phone,Email,class_code],(err,result)=>{
    if(err){
      return res.status(500).json({error:"Failed to add student"})
    }
    res.json({id:result.insertID,...req.body})
  })
})
// Update student details (PATCH)
app.patch("/admin/Students/:Regno", (req, res) => {
  const { Regno } = req.params;
  const updates = req.body;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  let sql = "UPDATE student SET ";
  const values = [];

  Object.keys(updates).forEach((key, index) => {
    sql += `${key} = ?`;
    if (index < Object.keys(updates).length - 1) {
      sql += ", ";
    }
    values.push(updates[key]);
  });

  sql += " WHERE Regno = ?";
  values.push(Regno);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating student:", err);
      return res.status(500).json({ error: "Failed to update student" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json({ message: "Student updated successfully" });
  });
});

// Delete a student (DELETE)
app.delete("/admin/Students/:Regno", (req, res) => {
  const { Regno } = req.params;

  const sql = "DELETE FROM student WHERE Regno = ?";
  db.query(sql, [Regno], (err, result) => {
    if (err) {
      console.error("Error deleting student:", err);
      return res.status(500).json({ error: "Failed to delete student" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json({ message: "Student deleted successfully" });
  });
});


app.get("/attendance-percentage", async (req, res) => {
  const { class_code, startDate, endDate } = req.query;
  console.log(req.query)
  console.log("Im in attendance percentage")

  if (!class_code || !startDate || !endDate) {
      return res.status(400).json({ error: "Class code and date range are required" });
  }

  const query = `
      SELECT a.Regno,s.name,COUNT(*) AS total_days,
             SUM(a.hour1) + SUM(a.hour2) + SUM(a.hour3) + 
             SUM(a.hour4) + SUM(a.hour5) AS attended_hours,
             (COUNT(*) * 5) AS total_hours
            
      FROM attendance a
      INNER JOIN student s ON s.Regno = a.Regno
      WHERE s.class_code = ?
      AND a.date BETWEEN ? AND ?
      GROUP BY a.Regno;
  `;

  try {
    db.query(query, [class_code, startDate, endDate], (error, rows) => {
      if (error) {
          console.error("Database Error:", error);
          return res.status(500).json({ error: error.message });
      }

      const formattedData = rows.map(row => ({
          Regno: row.Regno,
          name:row.name,
          attended_hours: row.attended_hours || 0,
          total_hours: row.total_hours || 0,
          percentage: row.total_hours ? ((row.attended_hours / row.total_hours) * 100).toFixed(2) : "0.00"
      }));

      res.json(formattedData);
    
  });
 } catch(error) {
    console.error("Database Error:", error); 
      res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});