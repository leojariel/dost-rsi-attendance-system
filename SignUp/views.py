from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.http import FileResponse, Http404
from .models import User
from django import forms
from django.core.mail import send_mail
from .forms import RegistrationForm
from .signature import save_signature
import json


def login(request):
    return render(request, "SignUP/index.html")

#Will be modified 
@login_required
def get_signature(request, profile_id):
    try:
        profile = User.objects.get(id=profile_id)
    except User.DoesNotExists:
        raise Http404

    if profile.user != request.user:
        raise Http404

    return FileResponse(
        profile.signature.open("rb"),
        content_type = "image/png"
    )

def register(request):
    if request.method == "POST":
        form = RegistrationForm(request.POST, request.FILES)
        signature_json = request.POST.get("signature_data")

        signature_data = json.loads(signature_json)

        if form.is_valid():
            email = form.cleaned_data["contactEmail"]
            User = form.save(commit=False)

            User.signature_data = signature_data

            save_signature(User, signature_data)

            User.save()

            send_mail(
                subject="Confirmation QR Code",
                message="Your account has been created.",
                from_email=None,
                recipient_list=[email],
            )

            print("The data was saved")

        else:
            print(form.errors)

    return render(request, "SignUp/register.html")