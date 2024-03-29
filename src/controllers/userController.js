const res = require("express/lib/response");
const fs = require("fs");
const path = require("path");

//Modulos requeridos para el proceso de register y de login.

const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const db = require("../data/models");
const { devNull } = require("os");

const controller = {
  //Index de usuarios -- OK
  index: function (req, res) {
    db.usuarios.findAll()
      .then((users) => {
      res.render("users/index", { users });
    });
  },
  
  register: function (req, res) {
    db.usuarios.findAll().then(function (usuarios) {
      res.render("users/register", { usuarios });
    });
  },

  //Proceso de validacion del register - Express Validator.
  processRegister: function (req, res) {
    let errorsForm = validationResult(req); 
    let avatar; 
      let registerUserDb;
      console.log(errorsForm)
      db.usuarios.findAll()
      .then(users => {
        registerUserDb = users.find(user => user.email == req.body.email)
      
      
       if (registerUserDb) {
        return res.render("users/register", {
          errors: {
            email: {
              msg: "Este email ya se encuentra registrado",
            },
          },
          oldData: req.body,
        }); 

      } else {
        if(errorsForm.isEmpty()) {
          
          if(!req.file) {
            avatar = "DefaultAvatar.jpg"
          } else {
            avatar = req.file.filename
          }

          let encryptedPass = bcrypt.hashSync(req.body.password, 10)
  
          db.usuarios.create({
            username: req.body.username,
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            password: encryptedPass,
            legal_buy: parseInt(req.body.legal_buy),
            avatar: avatar,
            isAdmin: 0
           })
           console.log("se creo el usuario")
           return res.redirect('/users/login');
          }
           if (!errorsForm.isEmpty()) {
            return res.render("users/register", {
              errors: errorsForm.mapped(),
              oldData: req.body,
            });
          
           
        } else {
          req.file = ""
          console.log("encontro errores")
          return res.render("users/register", {
            errors: errorsForm.mapped(),
            oldData: req.body,
          });
          
        }
      }   
    })   
    },

    login: function(req, res) {
      db.usuarios.findAll()
        .then(function(usuario){
          return res.render("users/login", {usuario : usuario});
        })
      
    },


    loginProcess: (req,res) => {
    let userToLogin
    db.usuarios.findAll()
    .then(usuario => {
      userToLogin = usuario.find(user => user.email == req.body.email)
      console.log(userToLogin)
      if (userToLogin) {
        let isOkThePassword = bcrypt.compareSync(
          req.body.password,
          userToLogin.password      
        );
  
        if (isOkThePassword) {
          delete userToLogin.password;
          req.session.userLogged = userToLogin;
          return res.redirect("/users/profile");
        }
  
        return res.render("users/login", {
          errors: {
            password: {
              msg: "Las credenciales son inválidas",
            },
          },
        });
      }
  
      return res.render("users/login", {
        errors: {
          email: {
            msg: "Este email no se encuentra registrado",
          },
        },
      });
      })                            

  },

  editView: (req, res) => {
    db.usuarios.findByPk(req.params.id)
    .then(users => {
      res.render("users/edit", {"user" : users});
    })
    
  },
  
  edit: (req, res) => {
    //falta agregar poder editar tambien la foto con el avatar = req.file.filename;
    let userAvatar
    let reqFile = req.file
    if (!reqFile){
      db.usuarios.findByPk(req.params.id)
      .then((usuario) => {
        userAvatar = usuario.dataValues.avatar
      })
    } else {
      userAvatar = req.file.filename
    }
    
    db.usuarios.update({
      username: req.body.username,
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email,
      password: req.body.password,
      avatar: userAvatar
    }, {
      where : {
        id : req.params.id
      }
    })
    res.redirect("/users");
  },
  deleteView: (req, res) => {
    db.usuarios.findByPk(req.params.id)
    .then(users => {
      res.render("users/delete", { "user" : users })
    })
  },
  delete: (req, res) => {
    db.usuarios.destroy({
      where: {
        id : req.params.id
      }
    })

    res.redirect("/users");
  },

  //Perfil del usuario.
  profile: (req, res) => {
    return res.render("users/profile", {
      user: req.session.userLogged,
      
    });
    
  },

  //Logout
  logout: (req, res) => {
    req.session.destroy();
    return res.redirect("/");
  },
};

module.exports = controller;
