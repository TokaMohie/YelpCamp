var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware/index");

router.get("/", function(req, res){
	Campground.find({}, function(err, campgrounds){
		if(err){
			console.log("erroor occurred");
		}
		else{
			res.render("campgrounds/index", {campgrounds: campgrounds});
		}
	});
});


router.post("/", middleware.isLoogedIn, function(req, res){
	var newCampground = req.body.campground;
	Campground.create(newCampground, function(err, camp){
		if(err){
			console.log(err);
		}
		else{
			camp.creator.id = req.user._id;
			camp.creator.username = req.user.username;
			camp.save();
			console.log(camp);
			res.redirect("/campgrounds");
		}
	});
});


router.get("/new", middleware.isLoogedIn, function(req, res){
	res.render("campgrounds/new");
});



router.get("/:id", function(req, res){
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err){
			console.log(err);
		}
		else{
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
	
});



router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});

router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		res.redirect("/campgrounds/"+updatedCampground._id);
	});
});

router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
          res.redirect("/campgrounds");
   });
});


module.exports = router;