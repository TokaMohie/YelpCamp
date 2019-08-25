var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground"),
	Comment = require("../models/comment");
var middleware = require("../middleware");

router.get("/new", middleware.isLoogedIn, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
		}
		else{
			res.render("comments/new", {campground: campground});
		}
	});
});

router.post("/", middleware.isLoogedIn, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
		}
		else{
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					req.flash("error", "Something went wrong.");
					console.log(err);
				}
				else{
					//add author to comment first and save it
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash("success", "Successfully created comment");
					res.redirect("/campgrounds/" + campground._id);
				}
			});
		}
	});
});

router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	Comment.findById(req.params.comment_id, function(err, comment){
		res.render("comments/edit", {campground_id: req.params.id, comment: comment});
	});
});

router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if(err){
			console.log(err);
			res.redirect("back");
		}
		else {
			res.redirect("/campgrounds/"+req.params.id);
		}
	});
});

router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		req.flash("success", "Comment deleted.");
		res.redirect("/campgrounds/" + req.params.id);
	});
});


module.exports = router;
