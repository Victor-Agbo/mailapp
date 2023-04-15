document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', submit_mail);
  // By default, load the inbox
  load_mailbox('inbox');
});

function archive_email(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  });

  load_mailbox('inbox');
}

function unarchive_email(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  });

  load_mailbox('inbox');
}

function reply_email(email) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  document.querySelector('#compose-body').value = `On ${email.timestamp}, ${email.sender} wrote: ${email.body}`;
}


function view_email(email_id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  fetch(`/emails/${email_id}`, {
    method: 'PUT', body: JSON.stringify({
      read: true
    })
  });
  fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
      var email_content = '<div class = "border-bottom" >'

      email_content += `<p><strong>From: </strong>${email.sender}`;
      email_content += `<p><strong>To: </strong>${email.recipients[0]}...`;
      email_content += `<p><strong>Subject: </strong>${email.subject}`;
      email_content += `<p><strong>Timestamp: </strong>${email.timestamp}`;
      if (!email.archived) {
        email_content += `<p><button class="btn btn-sm btn-outline-primary" id="inbox" onclick="reply_email({'sender': '${email.sender}', 'subject': '${email.subject}', 'timestamp':'${email.timestamp}', 'body':'${email.body}'})">Reply</button><button class="btn btn-sm btn-outline-secondary" id="archive" onclick="archive_email(${email.id})">Archive</button></div>`;
      } else {
        email_content += `<p><button class="btn btn-sm btn-outline-primary" id="inbox" onclick="reply_email({'sender': '${email.sender}', 'subject': '${email.subject}', 'timestamp':'${email.timestamp}', 'body':'${email.body}'})">Reply</button><button class="btn btn-sm btn-outline-secondary" id="archive" onclick="unarchive_email(${email.id})">Unarchive</button></div>`;
      }
      email_content += `<div>${email.body}</div>`;
      document.querySelector('#email-view').innerHTML = email_content;
    })
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      //console.log(emails);

      // ... do something else with emails ...
      var display_emails = '';
      emails.forEach(element => {

        //display_emails += `<a href="emails/${element.id}" style="color: black">`;
        if (element.read) { display_emails += `<div class="card mb-3" onclick="view_email(${element.id})" style="cursor: pointer"><div class="card-body">`; }
        else { display_emails += `<div class="card mb-3 bg-secondary text-light" onclick="view_email(${element.id})" style="cursor: pointer;"><div class="card-body">`; }

        display_emails += `<strong>${element.sender}</strong>`;
        display_emails += `<span class="p-5">${element.subject}</span>`;
        display_emails += `<i style="float: right;">${element.timestamp}</i>`;
        display_emails += '</div></div>'
      });

      document.querySelector('#emails-view').innerHTML += display_emails;
    });
}

function submit_mail() {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
    .then(response => response.json())
    .then(result => {
      // Print result
      //console.log(result);
    });
}

