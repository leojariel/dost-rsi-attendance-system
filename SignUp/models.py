from django.db import models
from django.utils.translation import gettext_lazy as _
import uuid

#Note, M is for database, Male is for forms
#Now redundant, I will now use stroke paths :(
def signature_path(instance, filename):
    extension = filename.split(".")[-1]
    return f"signatures/{uuid.uuid4()}.{extension}"

class User(models.Model):
    class Gender(models.TextChoices):
        MALE = "male", _("Male")
        FEMALE = "female", _("Female")
        OTHER = "other", _("Other")

    class Classification(models.TextChoices):
        BUSINESS = "business", "Business / Entrepreneur"
        GOVERNMENT = "government", "Government Employee"
        HOMEMAKER = "homemaker", "Homemaker"
        MEDIA = "media", "Media"
        OTHERS = "others", "Others"
        PRIVATE = "private", "Private Organization"
        STUDENT = "student", "Student / Academe"

    class Region(models.TextChoices):
        NCR = "1", "NCR (National Capital Region)"
        CAR = "2", "CAR (Cordillera Administrative Region)"
        R1 = "3", "Region I (Ilocos Region)"
        R2 = "4", "Region II (Cagayan Valley)"
        R3 = "5", "Region III (Central Luzon)"
        R4A = "6", "Region IV-A (CALABARZON)"
        R4B = "7", "Region IV-B (MIMAROPA)"
        R5 = "8", "Region V (Bicol Region)"
        R6 = "9", "Region VI (Western Visayas)"
        R7 = "10", "Region VII (Central Visayas)"
        R8 = "11", "Region VIII (Eastern Visayas)"
        R9 = "12", "Region IX (Zamboanga Peninsula)"
        R10 = "13", "Region X (Northern Mindanao)"
        R11 = "14", "Region XI (Davao Region)"
        R12 = "15", "Region XII (SOCCSKSARGEN)"
        R13 = "16", "Region XIII (CARAGA)"
        BARMM = "17", "BARMM (Bangsamoro)"

    class AgeRange(models.TextChoices):
        ONE_TO_14 = "1-14", "1 to 14"
        FIFTEEN_TO_30 = "15-30", "15 to 30"
        THIRTY1_TO_59 = "31-59", "31 to 59"
        SIXTY_UPWARDS = "60+", "60 upwards"

    class VisitorType(models.TextChoices):
        EXHIBITOR = "exhibitor", _("EXHIBITOR")
        ORGANIZER_OR_FACILITATOR = "organizer", _("ORGANIZER / FACILITATOR")
        PARTICIPANT_OR_WALK_IN = "participant", _("PARTICIPANT / WALK-IN")
        SPEAKER = "speaker", _("SPEAKER")
        VOLUNTEER = "volunteer", _("VOLUNTEER")

    class Activities(models.TextChoices):
        TWO026_GRAND_TKME_EXHIBIT = "exhibit-tkime", _("2026 Grand TKME Exhibit")
        TWO026_S_AND_T_EXHIBIT = "exhibit-st", _("2026 S&T Exhibit")
        PLENARY_SESSIONS = "plenary", _("Plenary Sessions")
        INNOVATION_PITCH_COMPETITION = "innovation-pitch", _("Innovation Pitch Competition")

    id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False,
    )

    firstName = models.CharField(max_length=30)

    middleName = models.CharField(max_length=30, blank=True)

    lastName = models.CharField(max_length=30)

    privacyConsent = models.BooleanField(
        default=False
    )

    gender = models.CharField(
        max_length = 6,
        choices = Gender.choices,
    )

    classification = models.CharField(
        max_length=10,
        choices = Classification.choices
    )

    ageRange = models.CharField(
        max_length = 5,
        choices = AgeRange.choices
    )

    contactEmail = models.EmailField(
        unique=True,
    )

    visitorType = models.CharField(
        max_length= 11,
        choices = VisitorType.choices
    )

    affiliation = models.CharField(
        max_length=60,
        default=None
    )

    activities = models.CharField(
        max_length = 20,
        choices = Activities.choices
    )

    region = models.CharField(
        max_length = 2,
        choices= Region.choices,
    )

    signature_data = models.JSONField()

    e_signature = models.ImageField(
        upload_to=signature_path,
    )

    def __str__(self):
        return f"{self.firstName, self.id, self.middleName, self.signature_data}"