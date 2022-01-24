const mongoose = require("mongoose");

const Project = mongoose.model(
  "Projects",
  new mongoose.Schema({
    c_id: String,
    project_title: String,
    image: String,
    summary: String,
    service_type: String,
    launch_date: String,
    complete_date: String,
    prompts: [{
      _id_: Number,
      prompt_title: String,
      prompt_message: String,
      refs: String,
      c_date: String,
      addressed: Boolean,
      reviewed: Boolean
    }],
    drafts: [{
      _id_: Number,
      text: String,
      img_link: String,
      img: Boolean,
      s_date: String,
    }],
    finalized: [{
      _id_ : Number,
      filename: String,
      f_date: String,
      link: String,
    }],
    budget: Number,
    fees_billable: Number,
    fees_due: Number,
    active_status: Boolean,
  })
);

module.exports = Project;