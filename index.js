const express = require("express");
const App = express();
const cors = require("cors");
const multer = require("multer");
const mysql = require("mysql2");
const path = require("path");
const { count } = require("console");
const { json } = require("express");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "vijay",
  database: "rayalaseemauniversity",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

const Port = 5000;
var addColleges = [];
App.use(cors());
App.use(express.json());
let allData = {
  colleges: "",
  courses: "",
  faculty: "",
  students: "",
};
App.post('/deleteBuilding',(req,res) => {
  const {jnbCode} = req.body;
  console.log(jnbCode)
  try {
    con.query(`delete from collegebuildings where jnbCode = '${jnbCode}'`,(error, result) => {
      if(result) {
        res.json({success: true})
      } else {
        res.json({success: false})
      }
    })
    
  } catch (error) {
    
  }
})
App.get('/getBuilding/:jnbCode',(req, res)=> {
  const {jnbCode} = req.params;
  console.log(jnbCode)
  try {
    con.query(`select * from collegebuildings where jnbCode='${jnbCode}'`,(error, result) =>{
      console.log(result)
      if(result) {
        res.json({success: true, data: result})
      } else {
        res.json({success: false })
      }
    })
    
  } catch (error) {
    
  }
})
App.post("/setEnable", (req, res) => {
  const { registration } = req.body;
  try {
    con.query(
      `update collegeenable set enable= '${registration}'`,
      (error, result) => {
        console.log(result);
        if (result.affectedRows !== 0) {
          res.json({ success: true });
        } else {
          res.json({ success: false });
        }
      }
    );
  } catch (error) {}
});
App.get("/enable", (req, res) => {
  try {
    con.query("select * from collegeenable", (error, result) => {
      if (result) {
        console.log("enable result", result);
        res.json({ success: true, data: result });
      } else {
        res.json({ success: false });
      }
    });
  } catch (error) {
    console.log(error);
  }
});
App.get("/fullFaculty", (req, res) => {
  const stmt = `select f.facultyName, f.facultyDesignation, f.facultyEmail, f.departmentName, f.courseId, f.hieghtDegree, f.mobileNumber, f.accountNumber, f.ifcsCode, f.profileImage, f.heightDegreeCertificate, f.jnbCode, f.adharCardNumber, f.courseName, f.medium,f.gender, f.salary, f.category, f.teachingPosition,f.dateOfJoin,   c.allotedSeats,  d.collegeName, d.natureOfCollege, d.address
  from facultydetails as f, collegecourses as c, collegecredential as d
  where f.courseId = c.courseId and f.jnbCode = d.jnbCode`;
  try {
    con.query(stmt, (error, result) => {
      if (result) {
        res.json({ success: true, data: result });
      } else {
        res.json({ success: false });
      }
    });
  } catch {
    console.log("error");
  }
});
App.get("/fullCourse", (req, res) => {
  const stmt = `
  select b.courseId, b.courseName,b.medium,b.courseCategory, a.collegeName,a.address, a.jnbCode , b.facultyCount,b.labCount, b.classCount,b.allotedSeats, b.enroll2022, b.enroll2021,b.enroll2020,b.enroll2019, b.enroll2018
  from collegecredential as a ,collegecourses as b 
  where a.jnbCode = b.collegeCode order by b.courseName asc`;
  try {
    con.query(stmt, (error, result) => {
      if (result) {
        res.json({ success: true, data: result });
      } else {
        res.json({ success: false });
      }
    });
  } catch {
    console.log("error");
  }
});
App.get("/fullCollege", (req, res) => {
  const stmt = `
  select  a.collegeName, a.jnbCode , a.address, a.natureOfCollege, count(b.courseId) as totalCourse, sum(b.facultyCount) as totalFaculty, sum(b.labCount) as totalLabs, sum(b.classCount) as totalClassRooms, sum(b.allotedSeats) as totalIntake, sum(b.enroll2022) as total2022, sum(b.enroll2021) as total2021, sum(b.enroll2020) as total2020, sum(b.enroll2019) as total2019, sum(b.enroll2018) as total2018
  from collegecredential as a ,collegecourses as b 
  where a.jnbCode = b.collegeCode  group by b.collegeCode order by a.collegeName asc
  `;
  try {
    con.query(stmt, (error, result) => {
      if (result) {
        res.json({ success: true, data: result });
      } else {
        res.json({ success: false });
      }
    });
  } catch (error) {}
});
App.post("/deleteLab", (req, res) => {
  const { jnbCode, courseId, courseName, medium, roomNo } = req.body;
  console.log(req.body);
  try {
    const stmt = `delete from collegelabs where jnbCode='${jnbCode}' and courseId='${courseId}' and courseName='${courseName}' and medium='${medium}' and roomNo='${roomNo}'`;
    console.log(stmt);
    con.query(stmt, (error, result) => {
      if (result.affectedRows != 0) {
        console.log("delete result", result);
        //update in course
        try {
          const stmt = `select labCount from collegeCourses where courseId='${courseId}' and courseName='${courseName}' and medium ='${medium}' and collegeCode='${jnbCode}'`;
          console.log(stmt);
          con.query(stmt, (mistake, output) => {
            console.log("output", output);
            if (output.length > 0) {
              const counts = output[0].labCount;
              console.log("lab count", counts);
              let labNo;
              if (Number(counts) > 0) {
                labNo = Number(counts) - 1;
              } else {
                labNo = Number(counts);
              }

              console.log("lab number", labNo);

              const update = `update collegecourses set labCount='${labNo}' where  courseId='${courseId}' and courseName='${courseName}' and medium ='${medium}' and collegeCode='${jnbCode}'`;
              con.query(update, (updateerror, updateresult) => {
                console.log(updateerror);
                console.log("update rusult", updateresult);
                if (updateresult) {
                  res.json({ success: true });
                } else {
                  res.json({ success: false });
                }
              });
            } else {
              res.json({ success: false });
            }
          });
        } catch {
          console.log(error);
        }

        //end update
      } else {
        res.json({ success: false });
      }
    });
  } catch {}
});
// delete class
App.post("/deleteClass", (req, res) => {
  const { jnbCode, courseId, courseName, medium, roomNo } = req.body;
  console.log(req.body);
  try {
    const stmt = `delete from collegeclasses where jnbCode='${jnbCode}' and courseId='${courseId}' and courseName='${courseName}' and medium='${medium}' and roomNo='${roomNo}'`;
    console.log(stmt);
    con.query(stmt, (error, result) => {
      if (result.affectedRows != 0) {
        //update in course
        console.log("result1", result);
        try {
          const stmt = `select classCount from collegeCourses where courseId='${courseId}' and courseName='${courseName}' and medium ='${medium}' and collegeCode='${jnbCode}'`;
          console.log(stmt);
          con.query(stmt, (mistake, output) => {
            console.log("output", output);
            if (output.length > 0) {
              const counts = output[0].classCount;
              console.log("class count", counts);
              let classNo = Number(counts) - 1;
              console.log("class number", classNo);

              const update = `update collegecourses set classCount='${classNo}' where  courseId='${courseId}' and courseName='${courseName}' and medium ='${medium}' and collegeCode='${jnbCode}'`;
              con.query(update, (updateerror, updateresult) => {
                console.log(updateerror);
                console.log(updateresult);
                if (updateresult) {
                  res.json({ success: true });
                } else {
                  res.json({ success: false });
                }
              });
            } else {
              res.json({ success: false });
            }
          });
        } catch {
          console.log(error);
        }

        //end update
      } else {
        res.json({ success: false });
      }
    });
  } catch {}
});
App.post(`/deleteFaculty/:email`, (req, res) => {
  const { email } = req.params;
  console.log(email);
  try {
    con.query(
      `select  courseId,courseName, jnbCode, medium from facultydetails where facultyEmail ='${email}' `,
      (error, result) => {
        if (result.length > 0) {
          const { courseId, courseName, jnbCode, medium } = result[0];
          console.log(result[0]);
          con.query(
            `delete from facultydetails where facultyEmail ='${email}'`,
            (error, result) => {
              if (result) {
                //update in course
                try {
                  const stmt = `select facultyCount from collegeCourses where courseId='${courseId}' and courseName='${courseName}' and medium ='${medium}' and collegeCode='${jnbCode}'`;
                  console.log(stmt);
                  con.query(stmt, (mistake, output) => {
                    console.log("output", output);
                    if (output.length > 0) {
                      const counts = output[0].facultyCount;
                      console.log("faculty count", counts);
                      let facultyNo = Number(counts) - 1;
                      console.log("fcaulty number", facultyNo);

                      const update = `update collegecourses set facultyCount='${facultyNo}' where  courseId='${courseId}' and courseName='${courseName}' and medium ='${medium}' and collegeCode='${jnbCode}'`;
                      con.query(update, (updateerror, updateresult) => {
                        console.log(updateerror);
                        console.log(updateresult);
                        if (updateresult) {
                          res.json({ success: true });
                        } else {
                          res.json({ success: false, error: null });
                        }
                      });
                    } else {
                      res.json({ success: false, error: null });
                    }
                  });
                } catch {
                  console.log(error);
                }

                //end update in
              } else {
                res.json({ success: false });
              }
            }
          );
        } else {
          res.json({ success: false });
        }
      }
    );
  } catch {}
});
App.get("/allData", (req, res) => {
  try {
    con.query(
      "select count(jnbCode) from collegecredential",
      (error, result) => {
        if (result) {
          allData = {
            ...allData,
            colleges: result[0]["count(jnbCode)"],
          };
          console.log(allData);
          // course data
          try {
            con.query(
              "select count(courseId) from courselist",
              (error, result) => {
                if (result) {
                  console.log(result);
                  allData = {
                    ...allData,
                    courses: result[0]["count(courseId)"],
                  };
                  console.log(allData);
                  //faculty data
                  try {
                    con.query(
                      "select count(facultyEmail) from facultydetails",
                      (error, result) => {
                        if (result) {
                          console.log(result);
                          allData = {
                            ...allData,
                            faculty: result[0]["count(facultyEmail)"],
                          };
                          console.log(allData);
                          try {
                            con.query(
                              "select sum(enroll2022) from collegecourses",
                              (error, result) => {
                                console.log(result);
                                if (result) {
                                  allData = {
                                    ...allData,
                                    students: result[0]["sum(enroll2022)"],
                                  };
                                  res.json({ success: true, data: allData });
                                } else {
                                  res.json({ success: false });
                                }
                              }
                            );
                          } catch {}
                        } else {
                          res.json({ success: false });
                        }
                      }
                    );
                  } catch {}

                  // end faculty
                } else {
                  res.json({ success: false });
                }
              }
            );
          } catch {
            console.log(error);
          }

          //end course data
        } else {
          res.json({ success: false });
        }
      }
    );
  } catch {}
});
App.post("/courseCollegeEdit/:courseCollege", (req, res) => {
  const { courseCollege } = req.params;
  const [courseId, collegeCode] = courseCollege.split("_");
  console.log(courseId, collegeCode);
  console.log(req.body);

  try {
    const sql = `update collegecourses set courseId ='${req.body.courseId}', courseName='${req.body.courseName}',allotedSeats='${req.body.allotedSeats}',medium='${req.body.medium}', collegeDuration ='${req.body.courseDuration}', enroll2018='${req.body.enroll2018}', enroll2019='${req.body.enroll2019}', enroll2020='${req.body.enroll2020}', enroll2018='${req.body.enroll2021}', enroll2018='${req.body.enroll2022}' where courseId='${courseId}' and collegeCode='${collegeCode}' and medium="${req.body.selectedMedium}"`;
    con.query(sql, (error, result) => {
      console.log(result);
      console.log(error);
      if (result) {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    });
  } catch {
    res.json({ success: false });
  }
});

App.post("/deleteCollegeCourses", (req, res) => {
  const { courseId, jnbCode, courseName, medium } = req.body;
  console.log(req.body);
  try {
    con.query(
      `delete from collegecourses where courseId='${courseId}' and collegeCode='${jnbCode}'`,
      (error, result) => {
        if (result) {
          console.log(result);
          // res.json({ success: true });

          //delete faculty
          con.query(
            `delete from facultydetails where courseId='${courseId}' and jnbCode='${jnbCode}' and courseName='${courseName}' and medium='${medium}'`,
            (error2, result2) => {
              if (result2) {
                console.log("result2", result);
                con.query(
                  `delete from collegelabs where courseId='${courseId}' and jnbCode='${jnbCode}' and courseName='${courseName}' and medium='${medium}'`,
                  (error3, result3) => {
                    if (result3) {
                      console.log("result3", result3);
                      con.query(
                        `delete from collegeclasses where courseId='${courseId}' and jnbCode='${jnbCode}' and courseName='${courseName}' and medium='${medium}'`,
                        (error4, result4) => {
                          if (result4) {
                            console.log(result4);
                            res.json({ success: true });
                          } else {
                            res.json({ success: false });
                          }
                        }
                      );
                    } else {
                      res.json({ success: false });
                    }
                  }
                );
              } else {
                res.json({ success: false });
              }
            }
          );
        } else {
          res.json({ success: false });
        }
        console.log(error);
      }
    );
  } catch {
    res.json({ success: false });
  }
});

App.get("/getCourseList", (req, res) => {
  const sql = `select * from courselist`;

  try {
    con.query(sql, (error, result) => {
      // console.log(result)
      if (result) {
        res.json(result);
      } else {
        res.json({ success: false });
      }
    });
  } catch {
    res.json({ success: false });
  }
});

App.post("/courseList", (req, res) => {
  const { courseId, courseName, courseCategory } = req.body;
  const sql = `insert into courselist values(?,?,?)`;
  const value = [courseId, courseName, courseCategory];
  try {
    con.query(sql, value, (error, result) => {
      if (result) {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    });
  } catch {
    res.json({ success: false });
  }
});

//disk storage-----------------------------
// App.use(express.static(__dirname + '/public'));
App.use("/uploads", express.static("uploads"));
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.originalname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
  //filte type
  // fileFilter: (req, file, cb) => {
  //   if (
  //     file.mimetype == "image/png" ||
  //     file.mimetype == "image/gif" ||
  //     file.mimetype == "image/jpg" ||
  //     file.mimetype == "image/jpeg"
  //   ) {
  //     cb(null, true);
  //   } else {
  //     cb(null, false);
  //     return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
  //   }
  // },
});
var upload = multer({ storage: storage });
const uploadFacultyImages = upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "qualificationImage", maxCount: 1 },
]);
const uploadBuildingImages = upload.fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
  { name: "image4", maxCount: 1 },
  {name:'ecfile', maxCount: 1},
  {name:'landfile', maxCount: 1},
  {name:'leasedfile', maxCount: 1},
]);
App.post('/buildingUpload', uploadBuildingImages,(req,res) =>{
  const img1 = req.files.image1[0].filename;
  const img2 = req.files.image2[0].filename;
  const img3 = req.files.image3[0].filename;
  const img4 = req.files.image4[0].filename;
  const ecfile = req.files.ecfile[0].filename;
  const landfile = req.files.landfile[0].filename;
  const leased = req.files.leasedfile[0].filename;
 
 
  const {jnbCode,property,totalArea,address,phoneNumber,email,longitude, latitude} = req.body;
 
  const stmt=`insert into collegebuildings values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
  const value = [jnbCode, property, totalArea, address, phoneNumber, email, img1, img2, img3, img4,ecfile, landfile, leased,longitude,latitude];
  console.log(stmt);
  console.log(value);
  try {
    con.query(stmt,value, (error, result) =>{
      console.log(result);
      console.log(error)
      if(result){
        res.json({success: true})
      } else {
        console.log(error)
        res.json({success: false, error: error.sqlMessage})
      }
    })
  } catch (error) {
    
  }
})
App.post("/profileUpload", uploadFacultyImages, (req, res) => {
  const image1 = req.files.profileImage[0].filename;

  //   console.log(req.files.profileImage[0].filename);
  const image2 = req.files.qualificationImage[0].filename;
  //   console.log(req.body);
  const {
    facultyName,
    facultyEmail,
    mobileNumber,
    accountNumber,
    adharCardNumber,
    facultyDesignation,
    courseId,
    courseName,
    medium,
    ifcsCode,
    highestDegree,
    jnbCode,
    departmentName,
    gender,
    salary,
    dateOfJoin,
    category,

    teachingPosition,
  } = req.body;
  //    res.setHeader('Content-Type', 'multipart/form-data');
  try {
    const sql = `insert into facultydetails values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    const value = [
      facultyName,
      facultyDesignation,
      facultyEmail,
      departmentName,
      courseId,
      highestDegree,
      mobileNumber,
      accountNumber,
      ifcsCode,
      image1,
      image2,
      jnbCode,
      adharCardNumber,
      courseName,
      medium,
      gender,
      salary,
      dateOfJoin,
      category,

      teachingPosition,
    ];
    con.query(sql, value, (error, result) => {
      if (result) {
        try {
          const stmt = `select facultyCount from collegeCourses where courseId='${courseId}' and courseName='${courseName}' and medium ='${medium}' and collegeCode='${jnbCode}'`;
          console.log(stmt);
          con.query(stmt, (mistake, output) => {
            console.log("output", output);
            if (output.length > 0) {
              const counts = output[0].facultyCount;
              console.log("faculty count", counts);

              let facultyNo;

              facultyNo = Number(counts) + 1;
              console.log("fcaulty number", facultyNo);

              const update = `update collegecourses set facultyCount='${facultyNo}' where  courseId='${courseId}' and courseName='${courseName}' and medium ='${medium}' and collegeCode='${jnbCode}'`;
              con.query(update, (updateerror, updateresult) => {
                console.log(updateerror);
                console.log(updateresult);
                if (updateresult) {
                  res.json({ success: true });
                } else {
                  res.json({ success: false, error: null });
                }
              });
            } else {
              res.json({ success: false, error: null });
            }
          });
        } catch {
          console.log(error);
        }
      } else {
        console.log("messege", error);
        res.json({ success: false, error: error.sqlMessage });
      }

      // console.log(error)
    });
    // console.log(sql);
    // console.log(value);
  } catch {
    console.log(error);
    res.json({ success: false, error: error.setMessage });
  }
});
// App.post('/qualificationUpload', upload.single('qualificatonImage'), (req, res)=> {
//     console.log('qualification Upload',req)
// })

//-------------------end-------------------

//------lab----------------------------
App.get(`/getLabs/:jnbCode`, (req, res) => {
  let { jnbCode } = req.params;
  try {
    con.query(
      `select * from collegelabs where jnbCode ='${jnbCode}'`,
      (error, result) => {
        if (result) {
          res.json({ success: true, data: result });
        } else {
          res.json({ success: false });
        }
      }
    );
  } catch {}
});
App.get(`/getClasses/:jnbCode`, (req, res) => {
  let { jnbCode } = req.params;
  try {
    con.query(
      `select * from collegeclasses where jnbCode ='${jnbCode}'`,
      (error, result) => {
        if (result) {
          console.log("getclases", result);
          res.json({ success: true, data: result });
        } else {
          res.json({ success: false });
        }
      }
    );
  } catch {}
});
App.post("/addClass", upload.single("classImage"), (req, res) => {
  console.log(req.file);
  console.log(req.body);
  ///////////////////////
  let {
    jnbCode,
    courseId,
    courseName,
    medium,
    roomNo,
    capacity,
    measurements,
    classImage,
  } = req.body;
  classImage = req.file.filename;
  const sql = `insert into collegeclasses values(?,?,?,?,?,?,?,?)`;
  const values = [
    jnbCode,
    courseId,
    courseName,
    medium,
    roomNo,
    capacity,
    measurements,
    classImage,
  ];
  try {
    con.query(sql, values, (error, result) => {
      if (result) {
        //  res.json({success: true})
      } else {
        return res.json({ success: false, error: error.sqlMessage });
      }
    });
  } catch {
    return res.json({ success: false, error: error.sqlMessage });
  }
  /////////////
  try {
    const stmt = `select classCount from collegeCourses where courseId='${courseId}' and courseName='${courseName}' and medium ='${medium}' and collegeCode='${jnbCode}'`;
    console.log(stmt);
    con.query(stmt, (mistake, output) => {
      console.log("output", output);
      if (output) {
        const counts = output[0].classCount;
        console.log("lab count", counts);
        let classNo = Number(counts) + 1;
        console.log("class number", classNo);
        //update
        const update = `update collegecourses set classCount='${classNo}' where  courseId='${courseId}' and courseName='${courseName}' and medium ='${medium}' and collegeCode='${jnbCode}'`;
        console.log("updatae", update);
        con.query(update, (updateerror, updateresult) => {
          console.log(updateerror);
          console.log(updateresult);
          if (updateresult) {
            return res.json({ success: true });
          } else {
            return res.json({ success: false, error: updateerror.sqlMessage });
          }
        });

        //update
      } else {
        return res.json({ success: false, error: mistake.sqlMessage });
      }
    });
  } catch {}

  ///////////////////////////////////////
});

App.post("/addLabs", upload.single("labImage"), (req, res) => {
  // console.log(req.file);
  // console.log(req.body);
  let {
    jnbCode,
    courseId,
    courseName,
    medium,
    title,
    roomNo,
    batches,
    instruments,
    capacity,
    labImage,
  } = req.body;
  labImage = req.file.filename;
  const sql = `insert into collegelabs values(?,?,?,?,?,?,?,?,?,?)`;
  const values = [
    jnbCode,
    courseId,
    courseName,
    medium,
    title,
    roomNo,
    batches,
    instruments,
    capacity,
    labImage,
  ];
  try {
    con.query(sql, values, (error, result) => {
      if (result) {
        //  res.json({success: true})
      } else {
        return res.json({ success: false, error: error.sqlMessage });
      }
    });
  } catch {
    return res.json({ success: false, error: error.sqlMessage });
  }
  /////////////
  try {
    const stmt = `select labCount from collegeCourses where courseId='${courseId}' and courseName='${courseName}' and medium ='${medium}' and collegeCode='${jnbCode}'`;
    console.log(stmt);
    con.query(stmt, (mistake, output) => {
      console.log("output", output);
      if (output) {
        const counts = output[0].labCount;
        console.log("lab count", counts);
        let labNo = Number(counts) + 1;
        console.log("lab number", labNo);
        //update
        const update = `update collegecourses set labCount='${labNo}' where  courseId='${courseId}' and courseName='${courseName}' and medium ='${medium}' and collegeCode='${jnbCode}'`;
        console.log("updatae", update);
        con.query(update, (updateerror, updateresult) => {
          console.log(updateerror);
          console.log(updateresult);
          if (updateresult) {
            return res.json({ success: true });
          } else {
            return res.json({ success: false, error: updateerror.sqlMessage });
          }
        });

        //update
      } else {
        return res.json({ success: false, error: mistake.sqlMessage });
      }
    });
  } catch {}
  ////////

  ///////
});

//----------------end lab----------------------
App.get("/viewCollege/:jnbCode", (req, res) => {
  const { jnbCode } = req.params;
  try {
    con.query(
      `select jnbCode, collegeName, natureOfCollege, address from collegecredential where jnbCode="${jnbCode}"`,
      (error, result) => {
        res.json(result[0]);
      }
    );
  } catch {
    res.json({ success: false });
  }
});
App.post("/collegeLogin", (req, res) => {
  try {
    con.query(
      `select * from collegecredential where jnbCode ="${req.body.jnbCode}" `,
      (error, result) => {
        // console.log(result);
        if (result.length > 0) {
          if (result[0].jnbCode === req.body.jnbCode) {
            if (result[0].password === req.body.password) {
              res.json({ success: true });
            } else {
              res.json({ success: false });
            }
          }
        } else {
          res.json({ success: false });
        }
      }
    );
  } catch {
    res.json({ success: false });
  }
});
App.get("/getFaculty/:jnbCode", (req, res) => {
  const { jnbCode } = req.params;
  try {
    con.query(
      `select * from facultydetails where jnbCode = '${jnbCode}' order by courseName `,
      (error, result) => {
        if (result) {
          res.json(result);
        }
      }
    );
  } catch {
    console.log("faculty fetching errror");
  }
});
App.get("/credential", (req, res) => {
  try {
    con.query("select * from credential", (error, result) => {
      if (result) {
        res.json(result);
      } else {
        res.json({ success: false });
      }
    });
  } catch {
    res.json({ success: false, fail: true });
  }
});
// App.get('/',(req,res ) => {
//     console.log('hi');
//     res.send('hi')
// })

App.get("/collegeTable", (req, res) => {
  try {
    con.query(
      "select * from collegecredential order by jnbCode asc",
      (error, result) => {
        if (result) {
          res.json({ success: true, result: result });
        } else {
          res.json({ success: false, error: error });
        }
      }
    );
  } catch {
    res.json({ success: false, error: error });
  }
});

App.post("/addColleges", (req, res) => {
  const sql = `insert into collegecredential values(?,?,?,?,?,?,?,?,?)`;
  const insertData = [
    req.body.jnbCode,
    req.body.collegeName,
    req.body.natureOfCollege,
    req.body.address,
    req.body.password,
    req.body.longitude,
    req.body.latitude,
    req.body.status,
    req.body.eligible,
  ];
  try {
    con.query(sql, insertData, (error, result) => {
      if (result) {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    });
  } catch {
    res.json({ success: false });
  }
});
App.get("/fetchCourse/:jnbCode", (req, res) => {
  const { jnbCode } = req.params;
  try {
    con.query(
      `select * from collegecourses where collegeCode ="${jnbCode}" order by courseId asc`,
      (error, result) => {
        if (result) {
          res.json(result);
        } else {
          res.json({ success: false });
        }
        console.log(result);
        console.log(error);
      }
    );
  } catch {
    res.json({ success: false });
  }
});
App.get("/getCourse/:jnbCode", (req, res) => {
  const { jnbCode } = req.params;
  try {
    con.query(
      `select * from collegecourses where collegeCode ="${jnbCode}" order by courseId asc`,
      (error, result) => {
        if (result) {
          res.json(result);
        } else {
          res.json({ success: false });
        }
      }
    );
  } catch {
    res.json({ success: false });
  }
});
App.post("/cdcEditable", (req, res) => {
  try {
    const sql = `update collegecredential set collegeName='${req.body.collegeName}', natureOfCollege='${req.body.natureOfCollege}', address='${req.body.address}', password='${req.body.password}' where jnbCode='${req.body.jnbCode}'`;

    con.query(sql, (error, result) => {
      if (result) {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    });
  } catch {
    res.json({ success: false });
  }
});

App.get("/cdcEditable/:jnbCode", (req, res) => {
  const { jnbCode } = req.params;
  // console.log('pramis', jnbCode)

  try {
    con.query(
      `select * from collegecredential where jnbCode = ${jnbCode}`,
      (error, result) => {
        // console.log(result)
        res.json(result[0]);
      }
    );
  } catch {
    res.json({ success: false });
  }
});
App.post("/deleteCollege", (req, res) => {
  console.log("delete college");
  const { jnbCode } = req.body;
  const sql = `delete from collegecredential where jnbCode = '${jnbCode}'`;
  try {
    con.query(sql, (err, result) => {
      con.query(
        `delete from collegecourses where jnbCode = '${jnbCode}'`,
        (error, result1) => {
          con.query(
            `delete from collegeclasses where jnbCode = '${jnbCode}'`,
            (error, result2) => {
              con.query(
                `delete from collegelabs where jnbCode = '${jnbCode}'`,
                (error, result3) => {
                  con.query(
                    `delete from facultydetails where jnbCode = '${jnbCode}'`,
                    (error, result4) => {
                      con.query(
                        `delete from collegebuildings where jnbCode = '${jnbCode}'`,
                        (error, result5) => {
                          if (result5) {
                            console.log("all deleted");
                            res.json({ success: true });
                          } else {
                            res.json({ success: false });
                          }
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  } catch {
    res.json({ success: false, error: err });
  }
});
App.post("/registerCourse", (req, res) => {
  console.log("register course");
  const {
    courseDuration,
    courseId,
    courseName,
    collegeCode,
    allotedSeats,
    medium,
    facultyCount,
    labCount,
    enroll2018,
    enroll2019,
    enroll2020,
    enroll2021,
    enroll2022,
    classCount,
    courseCategory,
  } = req.body;
  console.log("register couress", req.body);
  try {
    const sql =
      "insert into collegecourses values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
    const values = [
      courseDuration,
      courseId,
      courseName,
      collegeCode,
      allotedSeats,
      medium,
      facultyCount,
      labCount,
      enroll2018,
      enroll2019,
      enroll2020,
      enroll2021,
      enroll2022,
      classCount,
      courseCategory,
    ];
    con.query(sql, values, (error, result) => {
      if (result) {
        res.json({ success: true });
      } else {
        console.log("course failed");
        res.json({ success: false });
      }
    });
  } catch {
    res.json({ success: false });
  }
});

App.listen(Port, () => {
  console.log(`Example app listening on port ${Port}`);
});
