from django import forms
from .models import User

#Variable name should match with html form names
class RegistrationForm(forms.ModelForm):
    class Meta:
        model = User
        fields = [
            "privacyConsent",
            "firstName",
            "middleName",
            "lastName",
            "gender",
            "classification",
            "ageRange",
            "contactEmail",
            "visitorType",
            "affiliation",
            "activities",
            "region",
            "signature_data",
        ]